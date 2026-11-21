import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { fetchUpstreamJson, UpstreamError } from '@/features/api-hub/api/upstream';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const library = params.get('library')?.trim();
  const version = params.get('version')?.trim();
  const url = library
    ? `https://api.cdnjs.com/libraries/${encodeURIComponent(library)}${version ? `/${encodeURIComponent(version)}` : ''}`
    : 'https://api.cdnjs.com/libraries';
  try {
    return NextResponse.json(await fetchUpstreamJson(url));
  } catch (error) {
    const status = error instanceof UpstreamError ? error.status : 502;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upstream error' },
      { status }
    );
  }
}
