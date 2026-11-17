import type { WorkspaceStatus } from '../api/types';

/** Human-readable label for a Coder workspace build status. */
export function workspaceStatusLabel(status: WorkspaceStatus | string): string {
  switch (status) {
    case 'pending':
      return 'Queued';
    case 'starting':
      return 'Starting';
    case 'running':
      return 'Running';
    case 'stopping':
      return 'Stopping';
    case 'stopped':
      return 'Stopped';
    case 'failed':
      return 'Failed';
    case 'deleting':
      return 'Deleting';
    case 'deleted':
      return 'Deleted';
    case 'canceled':
      return 'Canceled';
    default:
      return status;
  }
}

/** Badge variant for a workspace status, mapped onto the theme's semantic colours. */
export function workspaceStatusVariant(
  status: WorkspaceStatus | string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'running':
      return 'default';
    case 'failed':
      return 'destructive';
    case 'starting':
    case 'pending':
    case 'stopping':
      return 'secondary';
    default:
      return 'outline';
  }
}

/** True while a build is in flight and the UI should keep polling. */
export function isTransitionalStatus(status: WorkspaceStatus | string): boolean {
  return ['pending', 'starting', 'stopping', 'deleting'].includes(status);
}

export function formatRelativeTime(value: string | null | undefined): string {
  if (!value) return 'never';
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return 'never';
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
