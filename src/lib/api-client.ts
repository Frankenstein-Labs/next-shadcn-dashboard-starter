const BASE_URL = '/api';

export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!res.ok) {
    let detail = '';
    try {
      const payload = (await res.clone().json()) as { error?: unknown; message?: unknown };
      const candidate = payload.error ?? payload.message;
      if (typeof candidate === 'string' && candidate.length <= 240) detail = `: ${candidate}`;
    } catch {
      // Preserve the generic status when the response is not JSON.
    }
    throw new Error(`API error: ${res.status} ${res.statusText}${detail}`);
  }

  return res.json() as Promise<T>;
}
