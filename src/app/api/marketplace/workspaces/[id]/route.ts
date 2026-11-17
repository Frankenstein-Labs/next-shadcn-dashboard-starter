import { NextResponse } from 'next/server';

import {
  errorResponse,
  requireUserId,
  upstreamErrorResponse
} from '@/features/marketplace/api/http';
import {
  actOnUserWorkspace,
  ensureCoderUser,
  listUserWorkspaces
} from '@/features/marketplace/api/workspaces';
import type { WorkspaceAction } from '@/features/marketplace/api/types';

export const dynamic = 'force-dynamic';

const ACTIONS: WorkspaceAction[] = ['start', 'stop', 'restart', 'delete'];

/** GET /api/marketplace/workspaces/:id — one workspace owned by the signed-in user. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId();
  if ('response' in authResult) return authResult.response;

  const { id } = await params;
  try {
    const userId = await ensureCoderUser(authResult.userId);
    const workspaces = await listUserWorkspaces(userId);
    const workspace = workspaces.find((candidate) => candidate.id === id);
    if (!workspace) return errorResponse('Workspace not found', 404);
    return NextResponse.json({ workspace });
  } catch (error) {
    return upstreamErrorResponse(error);
  }
}

/** POST /api/marketplace/workspaces/:id — lifecycle action (start/stop/restart/delete). */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId();
  if ('response' in authResult) return authResult.response;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const action = (body as { action?: unknown } | null)?.action;
  if (typeof action !== 'string' || !ACTIONS.includes(action as WorkspaceAction)) {
    return errorResponse(`action must be one of: ${ACTIONS.join(', ')}`, 400);
  }

  try {
    const userId = await ensureCoderUser(authResult.userId);
    const workspace = await actOnUserWorkspace(userId, id, action as WorkspaceAction);
    return NextResponse.json({ workspace });
  } catch (error) {
    return upstreamErrorResponse(error);
  }
}
