import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getProvider } from '@/features/api-hub/api/registry';
import type { ProviderTestResult } from '@/features/api-hub/api/types';

export const dynamic = 'force-dynamic';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ providerId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { providerId } = await params;
  const provider = getProvider(providerId);
  if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 });

  const checkedAt = new Date().toISOString();
  if (provider.status === 'not_configured') {
    const result: ProviderTestResult = {
      providerId,
      status: 'not_configured',
      message: `Configurez ${provider.envKey} côté serveur avant de tester ce fournisseur.`,
      checkedAt
    };
    return NextResponse.json(result, { status: 409 });
  }

  if (!provider.apiUrl.startsWith('http')) {
    const result: ProviderTestResult = {
      providerId,
      status: 'error',
      message: 'Une URL de service valide est requise côté serveur.',
      checkedAt
    };
    return NextResponse.json(result, { status: 422 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(provider.apiUrl, {
      method: 'HEAD',
      redirect: 'manual',
      signal: controller.signal,
      cache: 'no-store'
    });
    const result: ProviderTestResult = {
      providerId,
      status: response.ok || (response.status >= 300 && response.status < 400) ? 'ok' : 'error',
      message: response.ok
        ? 'Le service a répondu.'
        : `Le service a répondu avec HTTP ${response.status}.`,
      checkedAt
    };
    return NextResponse.json(result, { status: result.status === 'ok' ? 200 : 502 });
  } catch {
    const result: ProviderTestResult = {
      providerId,
      status: 'error',
      message: 'Le service n’a pas répondu dans le délai imparti.',
      checkedAt
    };
    return NextResponse.json(result, { status: 504 });
  } finally {
    clearTimeout(timeout);
  }
}
