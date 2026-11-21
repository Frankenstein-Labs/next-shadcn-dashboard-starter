import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { fetchUpstreamJson, UpstreamError } from '@/features/api-hub/api/upstream';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const provider = params.get('provider');
  const api = params.get('api');
  const service = params.get('service');
  const path =
    provider && api
      ? `/specs/${encodeURIComponent(provider)}/${service ? `${encodeURIComponent(service)}/` : ''}${encodeURIComponent(api)}.json`
      : provider
        ? `/${encodeURIComponent(provider)}.json`
        : '/list.json';
  try {
    return NextResponse.json(await fetchUpstreamJson(`https://api.apis.guru/v2${path}`));
  } catch (error) {
    const status = error instanceof UpstreamError ? error.status : 502;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upstream error' },
      { status }
    );
  }
}
