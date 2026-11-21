import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { fetchUpstreamJson, UpstreamError, withBearer } from '@/features/api-hub/api/upstream';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const key = process.env.FORGE_API_KEY;
  if (!key)
    return NextResponse.json(
      { error: 'FORGE_API_KEY is not configured on the server' },
      { status: 503 }
    );
  const body = (await request.json().catch(() => null)) as {
    texts?: unknown;
    model?: unknown;
    input_type?: unknown;
    dim?: unknown;
  } | null;
  const texts =
    Array.isArray(body?.texts) && body.texts.every((value) => typeof value === 'string')
      ? body.texts
      : null;
  if (
    !texts ||
    texts.length === 0 ||
    texts.length > 128 ||
    texts.some((value) => value.length > 20_000)
  ) {
    return NextResponse.json(
      { error: 'texts must contain between 1 and 128 bounded strings' },
      { status: 400 }
    );
  }
  try {
    return NextResponse.json(
      await fetchUpstreamJson('https://api.voxell.ai/v1/embed', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...withBearer(key) },
        body: JSON.stringify({
          texts,
          model: body?.model ?? 'turbo',
          input_type: body?.input_type ?? 'document',
          ...(typeof body?.dim === 'number' ? { dim: body.dim } : {})
        })
      })
    );
  } catch (error) {
    const status = error instanceof UpstreamError ? error.status : 502;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upstream error' },
      { status }
    );
  }
}
