import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { fetchUpstreamJson, UpstreamError } from '@/features/api-hub/api/upstream';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const url = new URL('https://agentnexus.app/api/public/registry');
  for (const key of ['q', 'category', 'limit']) {
    const value = params.get(key);
    if (value) url.searchParams.set(key, value.slice(0, 100));
  }
  const headers = process.env.AGENT_NEXUS_API_KEY
    ? { 'x-api-key': process.env.AGENT_NEXUS_API_KEY }
    : undefined;
  try {
    return NextResponse.json(await fetchUpstreamJson(url.toString(), { headers }));
  } catch (error) {
    const status = error instanceof UpstreamError ? error.status : 502;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upstream error' },
      { status }
    );
  }
}
