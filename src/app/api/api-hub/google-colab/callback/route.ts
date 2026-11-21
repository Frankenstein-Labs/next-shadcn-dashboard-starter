import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  getGoogleColabMetadata,
  getGoogleColabRedirectUri,
  saveGoogleColabRefreshToken
} from '@/features/api-hub/google-colab';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  const error = requestUrl.searchParams.get('error');
  const store = await cookies();
  const expectedState = store.get('google_colab_oauth_state')?.value;
  store.delete('google_colab_oauth_state');

  if (error)
    return NextResponse.redirect(new URL('/dashboard/api-hub?google_colab=denied', request.url));
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.json({ error: 'Invalid Google OAuth state' }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_COLAB_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_COLAB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Google Colab OAuth credentials are not configured' },
      { status: 503 }
    );
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGoogleColabRedirectUri(),
      grant_type: 'authorization_code'
    }),
    cache: 'no-store'
  });
  const body = (await response.json()) as { refresh_token?: string; error?: string };
  if (!response.ok) {
    return NextResponse.json(
      { error: body.error ?? `Google OAuth failed with HTTP ${response.status}` },
      { status: 502 }
    );
  }

  const existing = await getGoogleColabMetadata(userId);
  const refreshToken = body.refresh_token;
  if (!refreshToken && !existing) {
    return NextResponse.json(
      { error: 'Google did not return a refresh token; reconnect and approve offline access' },
      { status: 502 }
    );
  }
  if (refreshToken) await saveGoogleColabRefreshToken(userId, refreshToken);
  return NextResponse.redirect(new URL('/dashboard/api-hub?google_colab=connected', request.url));
}
