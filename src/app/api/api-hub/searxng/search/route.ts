import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { fetchUpstreamJson, UpstreamError } from '@/features/api-hub/api/upstream';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const baseUrl = process.env.SEARXNG_API_URL;
  if (!baseUrl)
    return NextResponse.json(
      { error: 'SEARXNG_API_URL is not configured on the server' },
      { status: 503 }
    );
  const query = new URL(request.url).searchParams.get('q')?.trim();
  if (!query || query.length > 500)
    return NextResponse.json(
      { error: 'q is required and must be at most 500 characters' },
      { status: 400 }
    );
  const url = new URL('/search', baseUrl);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  try {
    return NextResponse.json(await fetchUpstreamJson(url.toString(), {}, 15_000));
  } catch (error) {
    const status = error instanceof UpstreamError ? error.status : 502;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upstream error' },
      { status }
    );
  }
}
