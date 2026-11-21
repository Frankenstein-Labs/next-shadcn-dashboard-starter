import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getProviders } from '@/features/api-hub/api/registry';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(getProviders());
}
