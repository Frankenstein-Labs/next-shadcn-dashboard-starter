import { mutationOptions, queryOptions } from '@tanstack/react-query';

import {
  createWorkspace,
  getEngineStatus,
  getMarketplaceCatalog,
  getMarketplaceTemplate,
  getWorkspace,
  getWorkspaceBuildLogs,
  getWorkspaceBuilds,
  getWorkspaces,
  runWorkspaceAction
} from './service';
import type { WorkspaceAction } from './types';

// Reads: query key + fetcher in one place, shared by the pages and the client hooks.
// Invalidate everything for this entity with marketplaceQueries.all().
export const marketplaceQueries = {
  all: () => ['marketplace'] as const,
  catalog: () =>
    queryOptions({
      queryKey: [...marketplaceQueries.all(), 'catalog'] as const,
      queryFn: getMarketplaceCatalog
    }),
  template: (id: string) =>
    queryOptions({
      queryKey: [...marketplaceQueries.all(), 'template', id] as const,
      queryFn: () => getMarketplaceTemplate(id)
    }),
  engine: () =>
    queryOptions({
      queryKey: [...marketplaceQueries.all(), 'engine'] as const,
      queryFn: getEngineStatus,
      // A cold Render service can take ~60s to wake; poll while the UI is open.
      refetchInterval: 30_000
    }),
  workspaces: () =>
    queryOptions({
      queryKey: [...marketplaceQueries.all(), 'workspaces'] as const,
      queryFn: () => getWorkspaces(),
      // Builds progress asynchronously in Coder; poll so status stays truthful.
      refetchInterval: 5_000
    }),
  workspace: (id: string) =>
    queryOptions({
      queryKey: [...marketplaceQueries.all(), 'workspace', id] as const,
      queryFn: () => getWorkspace(id),
      refetchInterval: 4_000
    }),
  workspaceBuilds: (id: string) =>
    queryOptions({
      queryKey: [...marketplaceQueries.all(), 'workspace-builds', id] as const,
      queryFn: () => getWorkspaceBuilds(id),
      refetchInterval: 5_000
    }),
  workspaceBuildLogs: (workspaceId: string, buildId: string) =>
    queryOptions({
      queryKey: [
        ...marketplaceQueries.all(),
        'workspace-build-logs',
        workspaceId,
        buildId
      ] as const,
      queryFn: () => getWorkspaceBuildLogs(workspaceId, buildId),
      refetchInterval: 5_000
    })
};

// Writes: only the mutationFn. Components own onSuccess/onError and cache
// invalidation so everything that follows a mutation stays in one place.
export const marketplaceMutations = {
  createWorkspace: () =>
    mutationOptions({
      mutationFn: (input: { templateName: string; workspaceName: string }) => createWorkspace(input)
    }),
  workspaceAction: () =>
    mutationOptions({
      mutationFn: ({ id, action }: { id: string; action: WorkspaceAction }) =>
        runWorkspaceAction(id, action)
    })
};
