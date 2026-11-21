import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { listGoogleColabRuntimes } from '@/features/api-hub/google-colab';

export const runtime = 'nodejs';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  try {
    return NextResponse.json(await listGoogleColabRuntimes(userId));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to list Google Colab runtimes' },
      { status: 502 }
    );
  }
}
