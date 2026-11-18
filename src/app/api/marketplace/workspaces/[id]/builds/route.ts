import { NextResponse } from 'next/server';

import { requireUserId, upstreamErrorResponse } from '@/features/marketplace/api/http';
import { ensureCoderUser, listUserWorkspaceBuilds } from '@/features/marketplace/api/workspaces';

export const dynamic = 'force-dynamic';

/** GET /api/marketplace/workspaces/:id/builds — real Coder build history. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId();
  if ('response' in authResult) return authResult.response;

  const { id } = await params;
  try {
    const coderUserId = await ensureCoderUser(authResult.userId);
    const builds = await listUserWorkspaceBuilds(coderUserId, id);
    return NextResponse.json({ builds });
  } catch (error) {
    return upstreamErrorResponse(error);
  }
}
