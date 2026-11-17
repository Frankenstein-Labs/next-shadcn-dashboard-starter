import { NextResponse } from 'next/server';

import { loadMarketplace } from '@/features/marketplace/api/catalog';
import { requireUserId, upstreamErrorResponse } from '@/features/marketplace/api/http';

export const dynamic = 'force-dynamic';

/** GET /api/marketplace/catalog — catalog merged with the live Coder engine. */
export async function GET() {
  const authResult = await requireUserId();
  if ('response' in authResult) return authResult.response;

  try {
    const catalog = await loadMarketplace();
    return NextResponse.json(catalog);
  } catch (error) {
    return upstreamErrorResponse(error);
  }
}
