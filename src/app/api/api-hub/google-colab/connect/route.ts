import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getGoogleColabAuthorizationUrl } from '@/features/api-hub/google-colab';
import { randomBytes } from 'node:crypto';

export const runtime = 'nodejs';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  try {
    const state = randomBytes(32).toString('hex');
    const store = await cookies();
    store.set('google_colab_oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600,
      path: '/'
    });
    return NextResponse.redirect(getGoogleColabAuthorizationUrl(state));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Google Colab OAuth is not configured' },
      { status: 503 }
    );
  }
}
