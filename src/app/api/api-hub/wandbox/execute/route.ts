import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { fetchUpstreamJson, UpstreamError } from '@/features/api-hub/api/upstream';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as {
    compiler?: unknown;
    code?: unknown;
    stdin?: unknown;
  } | null;
  const compiler = typeof body?.compiler === 'string' ? body.compiler.trim() : '';
  const code = typeof body?.code === 'string' ? body.code : '';
  const stdin = typeof body?.stdin === 'string' ? body.stdin : '';
  if (
    !compiler ||
    compiler.length > 100 ||
    !code ||
    code.length > 100_000 ||
    stdin.length > 20_000
  ) {
    return NextResponse.json({ error: 'compiler and bounded code are required' }, { status: 400 });
  }
  try {
    return NextResponse.json(
      await fetchUpstreamJson(
        'https://wandbox.org/api/compile.json',
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ compiler, code, stdin })
        },
        15_000
      )
    );
  } catch (error) {
    const status = error instanceof UpstreamError ? error.status : 502;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upstream error' },
      { status }
    );
  }
}
