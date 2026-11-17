import { NextResponse } from 'next/server';

import {
  errorResponse,
  requireUserId,
  upstreamErrorResponse
} from '@/features/marketplace/api/http';
import {
  createUserWorkspace,
  ensureCoderUser,
  listUserWorkspaces
} from '@/features/marketplace/api/workspaces';

export const dynamic = 'force-dynamic';

/** GET /api/marketplace/workspaces — the signed-in user's workspaces. */
export async function GET() {
  const authResult = await requireUserId();
  if ('response' in authResult) return authResult.response;

  try {
    const userId = await ensureCoderUser(authResult.userId);
    const workspaces = await listUserWorkspaces(userId);
    return NextResponse.json({ workspaces });
  } catch (error) {
    return upstreamErrorResponse(error);
  }
}

/** POST /api/marketplace/workspaces — create a workspace from an engine template. */
export async function POST(request: Request) {
  const authResult = await requireUserId();
  if ('response' in authResult) return authResult.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const { templateName, workspaceName } = (body ?? {}) as {
    templateName?: unknown;
    workspaceName?: unknown;
  };
  if (typeof templateName !== 'string' || typeof workspaceName !== 'string') {
    return errorResponse('templateName and workspaceName are required', 400);
  }

  try {
    const userId = await ensureCoderUser(authResult.userId);
    const result = await createUserWorkspace(userId, { templateName, workspaceName });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return upstreamErrorResponse(error);
  }
}
