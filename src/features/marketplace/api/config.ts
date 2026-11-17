// Server-only configuration for the Frankenstein-Labs integration.
//
// FRANKENSTEIN_API_SECRET and CODER_SESSION_TOKEN are privileged credentials:
// they are read from server environment variables and are never sent to the
// browser. Only server route handlers under src/app/api/marketplace/* import
// this module.

const trimTrailingSlash = (value: string | undefined) => (value ?? '').replace(/\/+$/, '');

export const FRANKENSTEIN_API_URL = trimTrailingSlash(
  process.env.FRANKENSTEIN_API_URL || 'https://frankenstein-api.onrender.com'
);

export const FRANKENSTEIN_API_SECRET = process.env.FRANKENSTEIN_API_SECRET ?? '';

// The API service proxies Coder under this prefix, so the browser never talks to
// Coder directly and never receives the Coder session token.
export const CODER_PROXY_PREFIX = '/api/coder';

// Requests can be slow on the first hit because Render free services spin down
// after ~15 minutes of inactivity and need ~30-60s to wake. The route handlers
// allow for that instead of failing fast.
export const UPSTREAM_TIMEOUT_MS = Number(process.env.FRANKENSTEIN_API_TIMEOUT_MS || 75_000);

export function isConfigured() {
  return Boolean(FRANKENSTEIN_API_URL && FRANKENSTEIN_API_SECRET);
}
