import { apiClient } from '@/lib/api-client';

import type {
  CreateWorkspaceResult,
  EngineStatus,
  MarketplaceCatalog,
  MarketplaceTemplate,
  WorkspaceAction
} from './types';

/**
 * Browser-side data access. These helpers call the same-origin route handlers
 * under /api/marketplace, which add the privileged credentials server-side.
 * No secret ever reaches this code.
 */

export function getMarketplaceCatalog(): Promise<MarketplaceCatalog> {
  return apiClient<MarketplaceCatalog>('/marketplace/catalog');
}

export function getMarketplaceTemplate(id: string): Promise<MarketplaceTemplate> {
  return apiClient<MarketplaceTemplate>(`/marketplace/templates/${encodeURIComponent(id)}`);
}

export function getEngineStatus(): Promise<EngineStatus> {
  return apiClient<EngineStatus>('/marketplace/engine');
}

export function getWorkspaces(): Promise<{ workspaces: import('./types').CoderWorkspace[] }> {
  return apiClient<{ workspaces: import('./types').CoderWorkspace[] }>('/marketplace/workspaces');
}

export function getWorkspace(id: string) {
  return apiClient<{ workspace: import('./types').CoderWorkspace }>(
    `/marketplace/workspaces/${id}`
  );
}

export function createWorkspace(input: {
  templateName: string;
  workspaceName: string;
}): Promise<CreateWorkspaceResult> {
  return apiClient<CreateWorkspaceResult>('/marketplace/workspaces', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export function runWorkspaceAction(id: string, action: WorkspaceAction) {
  return apiClient<{ workspace: import('./types').CoderWorkspace }>(
    `/marketplace/workspaces/${id}`,
    { method: 'POST', body: JSON.stringify({ action }) }
  );
}
