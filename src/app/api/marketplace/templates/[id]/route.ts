import { NextResponse } from 'next/server';

import { loadMarketplaceTemplate } from '@/features/marketplace/api/catalog';
import {
  errorResponse,
  requireUserId,
  upstreamErrorResponse
} from '@/features/marketplace/api/http';

export const dynamic = 'force-dynamic';

/** GET /api/marketplace/templates/:id — one merged template (id is the catalog path). */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireUserId();
  if ('response' in authResult) return authResult.response;

  const { id } = await params;
  try {
    const template = await loadMarketplaceTemplate(decodeURIComponent(id));
    if (!template) return errorResponse('Template not found', 404);
    return NextResponse.json(template);
  } catch (error) {
    return upstreamErrorResponse(error);
  }
}
