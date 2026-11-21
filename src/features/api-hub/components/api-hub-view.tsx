'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { apiHubQueries } from '../api/queries';
import { testApiProvider } from '../api/service';
import type { ApiProvider, ProviderCategory } from '../api/types';

interface ApiHubViewProps {
  category?: ProviderCategory;
  mode?: 'catalog' | 'keys' | 'usage';
}

export default function ApiHubView({ category, mode = 'catalog' }: ApiHubViewProps) {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery(
    apiHubQueries.providers()
  );
  const [search, setSearch] = React.useState('');
  const [testing, setTesting] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<Record<string, string>>({});

  const providers = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (data ?? []).filter((provider) => {
      if (category && provider.category !== category) return false;
      if (!needle) return true;
      return `${provider.name} ${provider.description} ${provider.category}`
        .toLowerCase()
        .includes(needle);
    });
  }, [category, data, search]);

  const handleTest = async (provider: ApiProvider) => {
    setTesting(provider.id);
    try {
      const result = await testApiProvider(provider.id);
      setFeedback((current) => ({ ...current, [provider.id]: result.message }));
    } catch (testError) {
      setFeedback((current) => ({
        ...current,
        [provider.id]: testError instanceof Error ? testError.message : 'Le test a échoué.'
      }));
    } finally {
      setTesting(null);
    }
  };

  if (mode === 'usage') return <UsageState />;
  if (mode === 'keys') return <KeysState providers={data ?? []} />;

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <GoogleColabCard />
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='relative min-w-0 flex-1'>
          <Icons.search className='text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2' />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Rechercher un fournisseur…'
            className='pl-8'
            aria-label='Rechercher un fournisseur'
          />
        </div>
        <Badge variant='outline' className='w-fit gap-1.5 px-3 py-1.5'>
          <Icons.lock className='size-3.5' /> Secrets côté serveur
        </Badge>
      </div>

      {isPending && (
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Skeleton key={item} className='h-64 rounded-xl' />
          ))}
        </div>
      )}
      {isError && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <Icons.warning />
            </EmptyMedia>
            <EmptyTitle>Impossible de charger l’API Hub</EmptyTitle>
            <EmptyDescription>
              {error instanceof Error ? error.message : 'Erreur inconnue'}
            </EmptyDescription>
          </EmptyHeader>
          <Button variant='outline' onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? <Icons.spinner className='animate-spin' /> : <Icons.arrowRight />}{' '}
            Réessayer
          </Button>
        </Empty>
      )}
      {data && providers.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <Icons.search />
            </EmptyMedia>
            <EmptyTitle>Aucun fournisseur trouvé</EmptyTitle>
            <EmptyDescription>Modifiez la recherche ou la catégorie sélectionnée.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {providers.length > 0 && (
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              testing={testing === provider.id}
              feedback={feedback[provider.id]}
              onTest={handleTest}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GoogleColabCard() {
  const [state, setState] = React.useState<'idle' | 'loading' | 'connected' | 'error'>('idle');
  const [message, setMessage] = React.useState('');
  const colabUrl =
    'https://colab.research.google.com/github/Frankenstein-Labs/next-shadcn-dashboard-starter/blob/main/notebooks/aetheris_colab_marimo.ipynb';

  const checkConnection = async () => {
    setState('loading');
    try {
      const response = await fetch('/api/api-hub/google-colab/runtimes', { cache: 'no-store' });
      const body = (await response.json()) as {
        connected?: boolean;
        runtimes?: Array<{ name?: string }>;
        error?: string;
      };
      if (!response.ok) throw new Error(body.error ?? 'Impossible de vérifier Google Colab.');
      setState(body.connected ? 'connected' : 'idle');
      setMessage(
        body.connected
          ? `${body.runtimes?.length ?? 0} runtime(s) Colab autorisé(s).`
          : 'Autorisation Google Colab non connectée.'
      );
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Impossible de vérifier Google Colab.');
    }
  };

  return (
    <div className='rounded-xl border p-4'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='flex items-start gap-3'>
          <Icons.code className='text-muted-foreground mt-0.5 size-5' />
          <div>
            <h3 className='font-medium'>Google Colab + marimo</h3>
            <p className='text-muted-foreground mt-1 max-w-2xl text-sm'>
              Connectez votre compte Google pour autoriser vos runtimes Colab. Les tests lourds
              s’exécutent dans votre runtime Google, pas dans Vercel.
            </p>
            {message && (
              <p
                className={cn(
                  'mt-2 text-xs',
                  state === 'error' ? 'text-destructive' : 'text-muted-foreground'
                )}
              >
                {message}
              </p>
            )}
          </div>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button
            size='sm'
            variant='outline'
            render={
              <Link
                href='/api/api-hub/google-colab/connect'
                aria-label='Se connecter à Google Colab'
              />
            }
          >
            Se connecter avec Google
          </Button>
          <Button
            size='sm'
            variant='secondary'
            onClick={checkConnection}
            disabled={state === 'loading'}
          >
            {state === 'loading' && <Icons.spinner className='animate-spin' />} Vérifier
          </Button>
          <Button
            size='sm'
            variant='ghost'
            render={
              <a
                href={colabUrl}
                target='_blank'
                rel='noreferrer noopener'
                aria-label='Ouvrir le notebook marimo dans Google Colab'
              />
            }
          >
            <Icons.externalLink /> Ouvrir marimo dans Colab
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProviderCard({
  provider,
  testing,
  feedback,
  onTest
}: {
  provider: ApiProvider;
  testing: boolean;
  feedback?: string;
  onTest: (provider: ApiProvider) => void;
}) {
  const configured = provider.status === 'configured';
  return (
    <div className='flex min-h-64 flex-col rounded-xl border p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <Badge variant='outline'>{provider.category}</Badge>
          <h3 className='mt-3 font-medium'>{provider.name}</h3>
        </div>
        <Badge variant={configured ? 'default' : 'secondary'}>
          {configured ? 'Configuré' : 'Non configuré'}
        </Badge>
      </div>
      <p className='text-muted-foreground mt-2 line-clamp-3 text-sm'>{provider.description}</p>
      <div className='mt-3 space-y-1 text-xs'>
        <p>
          <span className='font-medium'>Auth :</span> {provider.auth}
        </p>
        <p className='text-muted-foreground'>
          <span className='font-medium'>Limites :</span> {provider.limits}
        </p>
      </div>
      <div className='mt-auto flex flex-wrap items-center gap-2 pt-4'>
        <Button
          size='sm'
          variant='outline'
          render={
            <a
              href={provider.documentationUrl}
              target='_blank'
              rel='noreferrer noopener'
              aria-label={`Ouvrir la documentation de ${provider.name}`}
            />
          }
        >
          <Icons.externalLink /> Documentation
        </Button>
        <Button
          size='sm'
          variant='secondary'
          disabled={!configured || testing}
          onClick={() => onTest(provider)}
        >
          {testing && <Icons.spinner className='animate-spin' />} Tester
        </Button>
      </div>
      {feedback && (
        <p
          className={cn(
            'mt-3 text-xs',
            feedback.includes('répondu') ? 'text-emerald-600' : 'text-muted-foreground'
          )}
        >
          {feedback}
        </p>
      )}
    </div>
  );
}

function KeysState({ providers }: { providers: ApiProvider[] }) {
  return (
    <div className='rounded-xl border p-5'>
      <div className='flex items-start gap-3'>
        <Icons.lock className='text-muted-foreground mt-0.5 size-5' />
        <div>
          <h3 className='font-medium'>Configuration sécurisée côté serveur</h3>
          <p className='text-muted-foreground mt-1 text-sm'>
            Les clés ne sont pas saisies ni stockées dans le navigateur. Ajoutez les variables
            indiquées dans l’environnement Vercel ou dans le gestionnaire de secrets du service
            concerné.
          </p>
        </div>
      </div>
      <div className='mt-5 grid gap-2 md:grid-cols-2'>
        {providers.map((provider) => (
          <div
            key={provider.id}
            className='flex items-center justify-between gap-3 rounded-lg border p-3 text-sm'
          >
            <span>{provider.name}</span>
            <code className='text-muted-foreground text-xs'>{provider.envKey}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsageState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <Icons.trendingUp />
        </EmptyMedia>
        <EmptyTitle>Statistiques en attente de persistance</EmptyTitle>
        <EmptyDescription>
          Aucun chiffre n’est inventé. Les métriques d’appels, quotas et erreurs seront activées
          avec le stockage utilisateur et les politiques RLS prévues dans la prochaine phase.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
