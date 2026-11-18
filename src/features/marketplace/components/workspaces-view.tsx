'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
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
import type { CoderWorkspace, CoderWorkspaceBuild, WorkspaceAction } from '../api/types';
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
  const [selectedWorkspace, setSelectedWorkspace] = useState<CoderWorkspace | null>(null);
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
          pendingAction={
            actionMutation.isPending && actionMutation.variables?.id === workspace.id
              ? actionMutation.variables.action
              : undefined
          }
          onAction={(action) => actionMutation.mutate({ id: workspace.id, action })}
          onShowHistory={() => setSelectedWorkspace(workspace)}
        />
      ))}
      <BuildHistoryDialog
        workspace={selectedWorkspace}
        open={Boolean(selectedWorkspace)}
        onOpenChange={(open) => {
          if (!open) setSelectedWorkspace(null);
        }}
      />
    </div>
  );
}

function WorkspaceCard({
  workspace,
  pendingAction,
  onAction,
  onShowHistory
}: {
  workspace: CoderWorkspace;
  pendingAction?: WorkspaceAction;
  onAction: (action: WorkspaceAction) => void;
  onShowHistory: () => void;
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
          <Button size='sm' variant='outline' disabled={busy} onClick={onShowHistory}>
            <Icons.clock />
            History
          </Button>
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

function BuildHistoryDialog({
  workspace,
  open,
  onOpenChange
}: {
  workspace: CoderWorkspace | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedBuild, setSelectedBuild] = useState<CoderWorkspaceBuild | null>(null);
  const buildsQuery = useQuery({
    ...marketplaceQueries.workspaceBuilds(workspace?.id ?? ''),
    enabled: open && Boolean(workspace?.id)
  });
  const logsQuery = useQuery({
    ...marketplaceQueries.workspaceBuildLogs(workspace?.id ?? '', selectedBuild?.id ?? ''),
    enabled: open && Boolean(workspace?.id && selectedBuild?.id)
  });
  const builds = buildsQuery.data?.builds ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[min(80vh,720px)] overflow-auto sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Build history{workspace ? ` · ${workspace.name}` : ''}</DialogTitle>
          <DialogDescription>
            These entries and logs come directly from Coder. An empty list means Coder returned no
            history, not that a build was simulated.
          </DialogDescription>
        </DialogHeader>
        {buildsQuery.isPending ? (
          <Skeleton className='h-24 w-full' />
        ) : buildsQuery.isError ? (
          <p className='text-destructive text-sm'>
            {buildsQuery.error instanceof Error
              ? buildsQuery.error.message
              : 'Could not load build history.'}
          </p>
        ) : builds.length === 0 ? (
          <p className='text-muted-foreground text-sm'>Coder returned no build history.</p>
        ) : (
          <div className='grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]'>
            <div className='flex flex-col gap-2'>
              {builds.map((build) => (
                <button
                  key={build.id}
                  type='button'
                  className={cn(
                    'rounded-lg border p-3 text-left transition-colors hover:bg-muted',
                    selectedBuild?.id === build.id && 'border-primary bg-muted'
                  )}
                  onClick={() => setSelectedBuild(build)}
                >
                  <div className='flex items-center justify-between gap-2'>
                    <span className='font-medium'>Build #{build.build_number}</span>
                    <Badge variant={workspaceStatusVariant(build.status)}>
                      {workspaceStatusLabel(build.status)}
                    </Badge>
                  </div>
                  <p className='text-muted-foreground mt-1 text-xs'>
                    {build.transition} · {formatRelativeTime(build.created_at)}
                  </p>
                </button>
              ))}
            </div>
            <div className='min-h-40 rounded-lg border p-3'>
              {!selectedBuild ? (
                <p className='text-muted-foreground text-sm'>Select a build to inspect its logs.</p>
              ) : logsQuery.isPending ? (
                <Skeleton className='h-32 w-full' />
              ) : logsQuery.isError ? (
                <p className='text-destructive text-sm'>
                  {logsQuery.error instanceof Error
                    ? logsQuery.error.message
                    : 'Could not load build logs.'}
                </p>
              ) : logsQuery.data?.logs.length ? (
                <pre className='max-h-96 overflow-auto whitespace-pre-wrap text-xs'>
                  {logsQuery.data.logs
                    .map((log) => `[${log.created_at}] ${log.stage} ${log.output}`)
                    .join('\n')}
                </pre>
              ) : (
                <p className='text-muted-foreground text-sm'>
                  Coder returned no logs for this build.
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
