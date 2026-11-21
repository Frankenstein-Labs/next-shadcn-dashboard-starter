export class UpstreamError extends Error {
  status: number;
  details?: string;

  constructor(message: string, status = 502, details?: string) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function fetchUpstreamJson<T>(
  url: string,
  init: RequestInit = {},
  timeoutMs = 10_000
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal, cache: 'no-store' });
    const text = await response.text();
    let body: unknown;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      throw new UpstreamError(`Réponse JSON invalide de ${new URL(url).hostname}.`, 502);
    }
    if (!response.ok) {
      throw new UpstreamError(
        `Le fournisseur a répondu HTTP ${response.status}.`,
        502,
        JSON.stringify(body)
      );
    }
    return body as T;
  } catch (error) {
    if (error instanceof UpstreamError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new UpstreamError('Le fournisseur n’a pas répondu dans le délai imparti.', 504);
    }
    throw new UpstreamError('Le fournisseur est indisponible.', 502);
  } finally {
    clearTimeout(timeout);
  }
}

export function withBearer(key: string | undefined): Record<string, string> {
  return key ? { Authorization: `Bearer ${key}` } : {};
}
