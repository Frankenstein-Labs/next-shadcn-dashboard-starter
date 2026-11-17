'use client';

import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

import { marketplaceQueries } from '../api/queries';
import { formatRelativeTime } from './format';

/**
 * Live engine banner.
 *
 * Reports what was actually measured: the round-trip time of a real probe. On
 * Render free services the first request after a spin-down can take tens of
 * seconds, so a `waking` state is surfaced explicitly rather than pretending the
 * engine is down or up.
 */
export default function EngineStatusBanner() {
  const { data, isPending, isError, refetch, isFetching } = useQuery(marketplaceQueries.engine());

  if (isPending) {
    return (
      <Alert>
        <Icons.spinner className='animate-spin' />
        <AlertTitle>Contacting the engine</AlertTitle>
        <AlertDescription>
          Waking the Frankenstein-Labs API and Coder. The first request after a period of inactivity
          can take up to a minute.
        </AlertDescription>
      </Alert>
    );
  }

  if (isError || !data) {
    return (
      <Alert variant='destructive'>
        <Icons.warning />
        <AlertTitle>Engine status unavailable</AlertTitle>
        <AlertDescription className='flex flex-col gap-2'>
          <span>The status endpoint could not be reached. Marketplace data may be incomplete.</span>
          <Button variant='outline' size='sm' onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? <Icons.spinner className='animate-spin' /> : <Icons.arrowRight />}
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (data.state === 'connected') {
    const noDaemon = data.provisionerCount === 0;
    return (
      <Alert variant={noDaemon ? 'destructive' : 'default'}>
        {noDaemon ? <Icons.warning /> : <Icons.circleCheck />}
        <AlertTitle>
          {noDaemon ? 'Engine connected — no provisioner daemon running' : 'Engine connected'}
        </AlertTitle>
        <AlertDescription>
          Coder {data.version ?? 'unknown version'} answered in {data.latencyMs} ms.{' '}
          {data.provisionerCount} provisioner daemon{data.provisionerCount === 1 ? '' : 's'},{' '}
          {data.templateCount} template{data.templateCount === 1 ? '' : 's'} registered.{' '}
          {noDaemon
            ? 'Without a running provisioner daemon, no build can be executed.'
            : 'The engine can execute builds. Whether a build yields a usable workspace depends on the compute backend (for example Kubernetes) configured for the template.'}{' '}
          Checked {formatRelativeTime(data.checkedAt)}.
        </AlertDescription>
      </Alert>
    );
  }

  if (data.state === 'waking') {
    return (
      <Alert>
        <Icons.spinner className='animate-spin' />
        <AlertTitle>Engine is waking up</AlertTitle>
        <AlertDescription>
          No answer after {data.wakeMs ?? 0} ms. Render free services spin down when idle and take
          tens of seconds to resume. Retrying automatically.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant='destructive'>
      <Icons.warning />
      <AlertTitle>Engine unavailable</AlertTitle>
      <AlertDescription>
        {data.error ?? 'The engine reported an unexpected state.'}
      </AlertDescription>
    </Alert>
  );
}
