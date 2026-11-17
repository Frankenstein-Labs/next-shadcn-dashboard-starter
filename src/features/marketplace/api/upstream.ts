import 'server-only';

import {
  CODER_PROXY_PREFIX,
  FRANKENSTEIN_API_SECRET,
  FRANKENSTEIN_API_URL,
  UPSTREAM_TIMEOUT_MS,
  isConfigured
} from './config';

/**
 * Thin server-side client for the Frankenstein-Labs API.
 *
 * The API service holds the Coder session token and exposes Coder's v2 API
 * under `${FRANKENSTEIN_API_URL}/api/coder/...`. Every privileged call therefore
 * goes through this module: the browser never sees the shared secret and never
 * sees the Coder session token.
 */

export class UpstreamError extends Error {
  status: number;
  /** True when the upstream was unreachable (e.g. a Render cold start). */
  unreachable: boolean;

  constructor(message: string, status: number, unreachable = false) {
    super(message);
    this.name = 'UpstreamError';
    this.status = status;
    this.unreachable = unreachable;
  }
}

export interface UpstreamResponse<T> {
  data: T;
  status: number;
  /** Wall-clock duration of the request, used to measure Render wake-up time. */
  durationMs: number;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  /** Path relative to the Frankenstein-Labs API root, e.g. `/api/catalog`. */
  path: string;
  timeoutMs?: number;
}

/**
 * Pull a human-readable error out of an upstream error body.
 *
 * The Frankenstein-Labs API returns `{ error }`; Coder returns `{ message }`.
 * Both are our own upstreams, so the text is safe to surface. Anything else
 * falls back to the status code so internals never leak.
 */
function extractErrorDetail(payload: unknown, status: number): string {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (typeof record.error === 'string') return record.error;
    if (typeof record.message === 'string') return record.message;
  }
  return `upstream responded ${status}`;
}

async function request<T>({
  path,
  method = 'GET',
  body,
  timeoutMs
}: RequestOptions): Promise<UpstreamResponse<T>> {
  if (!isConfigured()) {
    throw new UpstreamError('Frankenstein-Labs API is not configured', 503);
  }

  const startedAt = Date.now();
  let response: Response;
  try {
    response = await fetch(`${FRANKENSTEIN_API_URL}${path}`, {
      method,
      headers: {
        accept: 'application/json',
        'x-frankenstein-api-secret': FRANKENSTEIN_API_SECRET,
        ...(body === undefined ? {} : { 'content-type': 'application/json' })
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs ?? UPSTREAM_TIMEOUT_MS),
      cache: 'no-store'
    });
  } catch (error) {
    const reason = error instanceof Error ? error.name : 'unknown';
    throw new UpstreamError(`Frankenstein-Labs API unreachable (${reason})`, 503, true);
  }

  const durationMs = Date.now() - startedAt;
  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      throw new UpstreamError('Frankenstein-Labs API returned a non-JSON response', 502);
    }
  }

  if (!response.ok) {
    const detail = extractErrorDetail(payload, response.status);
    throw new UpstreamError(detail, response.status, response.status >= 500);
  }

  return { data: payload as T, status: response.status, durationMs };
}

/** GET a path on the Frankenstein-Labs API. */
export function upstreamGet<T>(path: string, timeoutMs?: number) {
  return request<T>({ path, timeoutMs });
}

/** Call a Coder v2 endpoint through the API service proxy. */
export function coderRequest<T>(
  coderPath: string,
  options: { method?: string; body?: unknown; timeoutMs?: number } = {}
) {
  const suffix = coderPath.startsWith('/') ? coderPath : `/${coderPath}`;
  return request<T>({
    path: `${CODER_PROXY_PREFIX}${suffix}`,
    method: options.method ?? 'GET',
    body: options.body,
    timeoutMs: options.timeoutMs
  });
}

/** Convenience wrapper that returns only the payload. */
export async function coderGet<T>(coderPath: string, timeoutMs?: number): Promise<T> {
  return (await coderRequest<T>(coderPath, { timeoutMs })).data;
}
