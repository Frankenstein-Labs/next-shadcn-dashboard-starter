import 'server-only';

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { UpstreamError } from './upstream';

/** JSON error body. Messages come from our own code, never from raw upstream text. */
export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Resolve the authenticated Clerk user id, or return a 401 response.
 * Every marketplace route handler requires this.
 */
export async function requireUserId(): Promise<{ userId: string } | { response: NextResponse }> {
  const { userId } = await auth();
  if (!userId) return { response: errorResponse('Unauthorized', 401) };
  return { userId };
}

/** Map an upstream failure onto a safe HTTP response. */
export function upstreamErrorResponse(error: unknown) {
  if (error instanceof UpstreamError) {
    return errorResponse(error.message, error.status);
  }
  return errorResponse('Unexpected error while contacting the engine', 500);
}
