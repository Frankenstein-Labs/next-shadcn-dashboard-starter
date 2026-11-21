import type { ApiProvider, ProviderTestResult } from './types';

export async function getApiProviders(): Promise<ApiProvider[]> {
  const response = await fetch('/api/api-hub/providers', { cache: 'no-store' });
  if (!response.ok) throw new Error('Impossible de charger le catalogue API.');
  return response.json() as Promise<ApiProvider[]>;
}

export async function testApiProvider(providerId: string): Promise<ProviderTestResult> {
  const response = await fetch(`/api/api-hub/providers/${providerId}/test`, { method: 'POST' });
  const result = (await response.json()) as ProviderTestResult;
  if (!response.ok && result.status !== 'not_configured') throw new Error(result.message);
  return result;
}
