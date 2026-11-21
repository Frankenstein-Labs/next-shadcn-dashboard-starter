import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { fetchUpstreamJson, UpstreamError, withBearer } from '@/features/api-hub/api/upstream';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const key = process.env.UNOROUTER_API_KEY;
  if (!key)
    return NextResponse.json(
      { error: 'UNOROUTER_API_KEY is not configured on the server' },
      { status: 503 }
    );
  try {
    return NextResponse.json(
      await fetchUpstreamJson('https://api.unorouter.com/v1/models', { headers: withBearer(key) })
    );
  } catch (error) {
    const status = error instanceof UpstreamError ? error.status : 502;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upstream error' },
      { status }
    );
  }
}
