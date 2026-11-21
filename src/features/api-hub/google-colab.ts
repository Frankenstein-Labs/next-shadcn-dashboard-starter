import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { clerkClient } from '@clerk/nextjs/server';

const COLAB_SCOPE = 'https://www.googleapis.com/auth/colaboratory';
const COLAB_API_BASE = 'https://colaboratory.googleapis.com/v1beta';
const METADATA_KEY = 'aetherisGoogleColab';

type GoogleColabMetadata = {
  refreshToken: string;
  connectedAt: string;
};

type Runtime = {
  name?: string;
  runtimeSpec?: {
    variant?: string;
    accelerator?: string;
    shape?: string;
  };
  version?: string;
};

function getEncryptionKey() {
  const encoded = process.env.GOOGLE_COLAB_TOKEN_ENCRYPTION_KEY;
  if (!encoded) throw new Error('GOOGLE_COLAB_TOKEN_ENCRYPTION_KEY is not configured');
  const key = Buffer.from(encoded, 'base64');
  if (key.length !== 32) {
    throw new Error('GOOGLE_COLAB_TOKEN_ENCRYPTION_KEY must decode to 32 bytes');
  }
  return key;
}

export function getGoogleColabRedirectUri() {
  const configured = process.env.GOOGLE_COLAB_REDIRECT_URI;
  if (configured) return configured;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) throw new Error('GOOGLE_COLAB_REDIRECT_URI or NEXT_PUBLIC_APP_URL is required');
  return `${appUrl.replace(/\/$/, '')}/api/api-hub/google-colab/callback`;
}

export function getGoogleColabAuthorizationUrl(state: string) {
  const clientId = process.env.GOOGLE_COLAB_CLIENT_ID;
  if (!clientId) throw new Error('GOOGLE_COLAB_CLIENT_ID is not configured');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleColabRedirectUri(),
    response_type: 'code',
    scope: `openid email profile ${COLAB_SCOPE}`,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, ciphertext].map((part) => part.toString('base64url')).join('.');
}

function decryptSecret(value: string) {
  const [ivEncoded, tagEncoded, ciphertextEncoded] = value.split('.');
  if (!ivEncoded || !tagEncoded || !ciphertextEncoded) throw new Error('Invalid encrypted token');
  const decipher = createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    Buffer.from(ivEncoded, 'base64url')
  );
  decipher.setAuthTag(Buffer.from(tagEncoded, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextEncoded, 'base64url')),
    decipher.final()
  ]).toString('utf8');
}

export async function getGoogleColabMetadata(userId: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const metadata = user.privateMetadata[METADATA_KEY];
  if (!metadata || typeof metadata !== 'object' || !('refreshToken' in metadata)) return null;
  return metadata as unknown as GoogleColabMetadata;
}

export async function saveGoogleColabRefreshToken(userId: string, refreshToken: string) {
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    privateMetadata: {
      [METADATA_KEY]: {
        refreshToken: encryptSecret(refreshToken),
        connectedAt: new Date().toISOString()
      }
    }
  });
}

async function getAccessToken(refreshToken: string) {
  const clientId = process.env.GOOGLE_COLAB_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_COLAB_CLIENT_SECRET;
  if (!clientId || !clientSecret)
    throw new Error('Google Colab OAuth credentials are not configured');
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: decryptSecret(refreshToken),
      grant_type: 'refresh_token'
    }),
    cache: 'no-store'
  });
  const body = (await response.json()) as { access_token?: string; error?: string };
  if (!response.ok || !body.access_token) {
    throw new Error(body.error ?? `Google token refresh failed with HTTP ${response.status}`);
  }
  return body.access_token;
}

export async function listGoogleColabRuntimes(userId: string) {
  const metadata = await getGoogleColabMetadata(userId);
  if (!metadata) return { connected: false as const, runtimes: [] as Runtime[] };
  const accessToken = await getAccessToken(metadata.refreshToken);
  const response = await fetch(`${COLAB_API_BASE}/runtimes`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store'
  });
  const body = (await response.json()) as { runtimes?: Runtime[]; error?: { message?: string } };
  if (!response.ok)
    throw new Error(body.error?.message ?? `Colab API returned HTTP ${response.status}`);
  return { connected: true as const, runtimes: body.runtimes ?? [] };
}

export { COLAB_SCOPE };
