import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { fetchUpstreamJson, UpstreamError } from '@/features/api-hub/api/upstream';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name } = await params;
  if (!name || name.length > 214 || name.includes('..'))
    return NextResponse.json({ error: 'Invalid package name' }, { status: 400 });
  try {
    return NextResponse.json(
      await fetchUpstreamJson(`https://registry.npmjs.org/${encodeURIComponent(name)}`)
    );
  } catch (error) {
    const status = error instanceof UpstreamError ? error.status : 502;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upstream error' },
      { status }
    );
  }
}
