import { NextResponse } from 'next/server';

import { probeEngine } from '@/features/marketplace/api/engine';
import { requireUserId } from '@/features/marketplace/api/http';

export const dynamic = 'force-dynamic';

/** GET /api/marketplace/engine — live engine status, including Render wake-up time. */
export async function GET() {
  const authResult = await requireUserId();
  if ('response' in authResult) return authResult.response;

  const status = await probeEngine();
  return NextResponse.json(status);
}
