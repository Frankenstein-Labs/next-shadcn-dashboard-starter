import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { fetchUpstreamJson, UpstreamError } from '@/features/api-hub/api/upstream';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as {
    text?: unknown;
    limit?: unknown;
  } | null;
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  const limit = typeof body?.limit === 'number' ? Math.min(Math.max(body.limit, 1), 50) : 10;
  if (!text || text.length > 500)
    return NextResponse.json(
      { error: 'text is required and must be at most 500 characters' },
      { status: 400 }
    );
  try {
    return NextResponse.json(
      await fetchUpstreamJson('https://neuronto.com/search', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: { text }, limit, federation: 'none' })
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
