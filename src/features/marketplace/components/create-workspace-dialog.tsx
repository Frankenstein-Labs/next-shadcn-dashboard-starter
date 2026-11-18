'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { Progress, ProgressIndicator, ProgressTrack } from '@/components/ui/progress';

import { marketplaceMutations, marketplaceQueries } from '../api/queries';
import type { MarketplaceTemplate } from '../api/types';
import { isTransitionalStatus, workspaceStatusLabel, workspaceStatusVariant } from './format';
import { Badge } from '@/components/ui/badge';

interface CreateWorkspaceDialogProps {
  template: MarketplaceTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/;

/**
 * Create a workspace from an engine template, then follow the *real* build.
 *
 * After the workspace is created, the dialog polls the workspace endpoint and
 * reports the Coder build status verbatim. It never reports success on its own:
 * "Running" is only shown once Coder itself reports it, and a failed job surfaces
 * Coder's own error string.
 */
export default function CreateWorkspaceDialog({
  template,
  open,
  onOpenChange
}: CreateWorkspaceDialogProps) {
  const queryClient = useQueryClient();
  const [name, setName] = React.useState('');
  const [workspaceId, setWorkspaceId] = React.useState<string | null>(null);

  // Reset the form when the dialog is (re)opened for a template. `key` on the
  // parent would also work, but resetting here keeps the dialog's state local.
  const openKey = `${open}:${template?.id ?? ''}`;
  const [lastOpenKey, setLastOpenKey] = React.useState(openKey);
  if (openKey !== lastOpenKey) {
    setLastOpenKey(openKey);
    if (open) {
      setName(template ? `${template.name}-dev` : '');
      setWorkspaceId(null);
    }
  }

  const createMutation = useMutation({
    ...marketplaceMutations.createWorkspace(),
    onSuccess: (result) => {
      setWorkspaceId(result.workspace.id);
      void queryClient.invalidateQueries({ queryKey: marketplaceQueries.all() });
    },
    onError: (error: Error) => toast.error(error.message)
  });

  // Poll only once a workspace exists; the build is what we follow.
  const workspaceQuery = useQuery({
    ...marketplaceQueries.workspace(workspaceId ?? ''),
    enabled: Boolean(workspaceId)
  });

  const workspace = workspaceQuery.data?.workspace;
  const buildStatus = workspace?.latest_build.status;
  const job = workspace?.latest_build.job;
  const trimmed = name.trim();
  const nameValid = NAME_PATTERN.test(trimmed);

  const handleCreate = () => {
    if (!template || !nameValid) return;
    createMutation.mutate({ templateName: template.name, workspaceName: trimmed });
  };

  const progressValue = buildStatus === 'running' ? 100 : buildStatus ? 45 : 15;
  const settled = buildStatus ? !isTransitionalStatus(buildStatus) : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
          <DialogDescription>
            {template
              ? `Provision a real workspace from “${template.displayName}”.`
              : 'Select a template first.'}
          </DialogDescription>
        </DialogHeader>

        {!workspaceId ? (
          <div className='flex flex-col gap-2'>
            <Label htmlFor='workspace-name'>Workspace name</Label>
            <Input
              id='workspace-name'
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder='my-workspace'
              autoComplete='off'
              aria-invalid={trimmed.length > 0 && !nameValid}
            />
            <p className='text-muted-foreground text-xs'>
              Lowercase letters, digits and hyphens, up to 32 characters.
            </p>
          </div>
        ) : (
          <div className='flex flex-col gap-3'>
            <div className='flex items-center justify-between gap-3'>
              <span className='text-sm font-medium'>Build status</span>
              <Badge variant={workspaceStatusVariant(buildStatus ?? 'pending')}>
                {isTransitionalStatus(buildStatus ?? 'pending') && (
                  <Icons.spinner className='animate-spin' />
                )}
                {workspaceStatusLabel(buildStatus ?? 'pending')}
              </Badge>
            </div>

            {buildStatus && isTransitionalStatus(buildStatus) ? (
              <Progress value={progressValue}>
                <ProgressTrack>
                  <ProgressIndicator />
                </ProgressTrack>
              </Progress>
            ) : null}

            {job?.status === 'failed' && job.error ? (
              <p className='text-destructive text-xs'>{job.error}</p>
            ) : (
              <p className='text-muted-foreground text-xs'>
                {settled
                  ? `The engine reported ${workspaceStatusLabel(buildStatus ?? 'unknown').toLowerCase()}. Open Workspaces for the recorded details.`
                  : 'The engine is building the workspace. This can take a while on first start.'}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {workspaceId && settled ? 'Close' : 'Cancel'}
          </Button>
          {!workspaceId && (
            <Button onClick={handleCreate} disabled={!nameValid || createMutation.isPending}>
              {createMutation.isPending ? (
                <Icons.spinner className='animate-spin' />
              ) : (
                <Icons.add />
              )}
              Create
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
