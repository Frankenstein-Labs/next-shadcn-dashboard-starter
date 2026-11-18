import { NextResponse } from 'next/server';

import { requireUserId, upstreamErrorResponse } from '@/features/marketplace/api/http';
import { ensureCoderUser, getUserWorkspaceBuildLogs } from '@/features/marketplace/api/workspaces';

export const dynamic = 'force-dynamic';

/** GET /api/marketplace/workspaces/:id/builds/:buildId/logs — real Coder logs. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; buildId: string }> }
) {
  const authResult = await requireUserId();
  if ('response' in authResult) return authResult.response;

  const { id, buildId } = await params;
  try {
    const coderUserId = await ensureCoderUser(authResult.userId);
    const logs = await getUserWorkspaceBuildLogs(coderUserId, id, buildId);
    return NextResponse.json({ logs });
  } catch (error) {
    return upstreamErrorResponse(error);
  }
}
