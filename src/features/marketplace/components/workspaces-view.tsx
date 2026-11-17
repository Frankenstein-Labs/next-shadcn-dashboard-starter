'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { marketplaceMutations, marketplaceQueries } from '../api/queries';
import type { CoderWorkspace, WorkspaceAction } from '../api/types';
import {
  formatRelativeTime,
  isTransitionalStatus,
  workspaceStatusLabel,
  workspaceStatusVariant
} from './format';

/**
 * The signed-in user's workspaces, read from the Coder engine through the API.
 * Each card reflects the real latest build: status, the template it came from
 * and when it was last used. Actions are applied to the engine and the list
 * re-reads the actual state instead of assuming the action succeeded.
 */
export default function WorkspacesView() {
  const queryClient = useQueryClient();
  const { data, isPending, isError, error, refetch, isFetching } = useQuery(
    marketplaceQueries.workspaces()
  );

  const actionMutation = useMutation({
    ...marketplaceMutations.workspaceAction(),
    onSuccess: (_result, variables) => {
      toast.success(`Workspace ${variables.action} requested`);
      void queryClient.invalidateQueries({ queryKey: marketplaceQueries.all() });
    },
    onError: (mutationError: Error) => toast.error(mutationError.message)
  });

  const workspaces = data?.workspaces ?? [];

  if (isPending) {
    return (
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className='h-40 w-full rounded-xl' />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Icons.warning className='text-destructive' />
            Could not load workspaces
          </CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'Unknown error'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant='outline' onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? <Icons.spinner className='animate-spin' /> : <Icons.arrowRight />}
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (workspaces.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <Icons.workspace />
          </EmptyMedia>
          <EmptyTitle>No workspaces yet</EmptyTitle>
          <EmptyDescription>
            Create one from the Marketplace tab. Workspaces are provisioned by the Coder engine and
            are private to your account.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link
            href='/dashboard/marketplace'
            className={cn(buttonVariants({ variant: 'outline' }), 'gap-1.5')}
          >
            <Icons.add />
            Browse the Marketplace
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
      {workspaces.map((workspace) => (
        <WorkspaceCard
          key={workspace.id}
          workspace={workspace}
          pendingAction={actionMutation.isPending ? actionMutation.variables?.action : undefined}
          onAction={(action) => actionMutation.mutate({ id: workspace.id, action })}
        />
      ))}
    </div>
  );
}

function WorkspaceCard({
  workspace,
  pendingAction,
  onAction
}: {
  workspace: CoderWorkspace;
  pendingAction?: WorkspaceAction;
  onAction: (action: WorkspaceAction) => void;
}) {
  const status = workspace.latest_build.status;
  const transitional = isTransitionalStatus(status);
  const isRunning = status === 'running';
  const busy = Boolean(pendingAction);

  return (
    <Card className='flex flex-col'>
      <CardHeader>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <CardTitle className='truncate text-base'>{workspace.name}</CardTitle>
            <CardDescription className='truncate text-xs'>
              {workspace.template_display_name || workspace.template_name}
            </CardDescription>
          </div>
          <Badge variant={workspaceStatusVariant(status)}>
            {transitional && <Icons.spinner className='animate-spin' />}
            {workspaceStatusLabel(status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className='flex flex-1 flex-col gap-3'>
        <div className='text-muted-foreground flex flex-col gap-1 text-xs'>
          <span className='inline-flex items-center gap-1'>
            <Icons.clock className='size-3.5' />
            Last used {formatRelativeTime(workspace.last_used_at)}
          </span>
          <span className='inline-flex items-center gap-1'>
            <Icons.code className='size-3.5' />
            Build #{workspace.latest_build.build_number}
          </span>
        </div>

        {workspace.latest_build.job.status === 'failed' && workspace.latest_build.job.error && (
          <p className='text-destructive line-clamp-3 text-xs'>
            {workspace.latest_build.job.error}
          </p>
        )}

        <div className='mt-auto flex flex-wrap gap-2 pt-2'>
          {isRunning ? (
            <Button size='sm' variant='outline' disabled={busy} onClick={() => onAction('stop')}>
              {pendingAction === 'stop' ? (
                <Icons.spinner className='animate-spin' />
              ) : (
                <Icons.circleX />
              )}
              Stop
            </Button>
          ) : (
            <Button size='sm' disabled={busy || transitional} onClick={() => onAction('start')}>
              {pendingAction === 'start' ? (
                <Icons.spinner className='animate-spin' />
              ) : (
                <Icons.arrowRight />
              )}
              Start
            </Button>
          )}
          <Button
            size='sm'
            variant='ghost'
            disabled={busy}
            onClick={() => onAction('restart')}
            title='Stop then start'
          >
            {pendingAction === 'restart' ? (
              <Icons.spinner className='animate-spin' />
            ) : (
              <Icons.brightness />
            )}
            Restart
          </Button>
          <Button
            size='sm'
            variant='destructive'
            disabled={busy}
            onClick={() => onAction('delete')}
          >
            {pendingAction === 'delete' ? (
              <Icons.spinner className='animate-spin' />
            ) : (
              <Icons.trash />
            )}
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
