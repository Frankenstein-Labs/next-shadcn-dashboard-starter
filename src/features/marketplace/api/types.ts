// Types shared between the marketplace route handlers (server) and the client
// feature. They mirror only the fields the UI actually consumes from the
// Frankenstein-Labs API and the Coder API, so a payload change upstream fails
// loudly in one place instead of silently rendering wrong data.

// ---------------------------------------------------------------------------
// Frankenstein-Labs catalog (GET /api/catalog on the Frankenstein-Labs API)
// ---------------------------------------------------------------------------

export type CatalogUnitKind = 'template' | 'module';

export interface CatalogUnit {
  kind: CatalogUnitKind;
  namespace: string;
  name: string;
  path: string;
  source: string;
  commit: string;
  license: string;
  description: string;
  files: string[];
}

export interface CatalogSourcePin {
  repository: string;
  commit: string;
}

export interface Catalog {
  schemaVersion: number;
  sources: Record<string, CatalogSourcePin>;
  templates: CatalogUnit[];
  modules: CatalogUnit[];
}

// ---------------------------------------------------------------------------
// Coder API subset
// ---------------------------------------------------------------------------

export interface CoderTemplate {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon: string;
  active_version_id: string;
  organization_id: string;
  organization_name: string;
  organization_display_name: string;
  created_at: string;
  updated_at: string;
  provisioner: string;
  active_user_count: number;
  build_time_stats?: {
    start?: { p50?: number; p95?: number };
    stop?: { p50?: number; p95?: number };
  };
}

export type WorkspaceStatus =
  | 'pending'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'failed'
  | 'canceling'
  | 'deleting'
  | 'deleted'
  | 'canceled';

export interface CoderWorkspaceAgent {
  id: string;
  name: string;
  status: string;
  lifecycle_state: string;
  first_connected_at?: string | null;
  last_connected_at?: string | null;
}

export interface CoderWorkspaceResource {
  id: string;
  type: string;
  name: string;
  agents: CoderWorkspaceAgent[];
}

export interface CoderProvisionerJob {
  id: string;
  status: 'pending' | 'running' | 'succeeded' | 'canceling' | 'failed' | 'canceled';
  error?: string;
}

export interface CoderProvisionerJobLog {
  id: number;
  created_at: string;
  log_source: string;
  log_level: string;
  stage: string;
  output: string;
}

export interface CoderWorkspaceBuild {
  id: string;
  workspace_id: string;
  build_number: number;
  transition: 'start' | 'stop' | 'delete';
  status: WorkspaceStatus;
  job: CoderProvisionerJob;
  resources: CoderWorkspaceResource[];
  created_at: string;
  updated_at: string;
}

export interface CoderWorkspace {
  id: string;
  name: string;
  owner_name: string;
  template_id: string;
  template_name: string;
  template_display_name: string;
  template_icon: string;
  created_at: string;
  updated_at: string;
  last_used_at: string;
  latest_build: CoderWorkspaceBuild;
}

// ---------------------------------------------------------------------------
// Marketplace view model (catalog + engine, merged server-side)
// ---------------------------------------------------------------------------

export type TemplateAvailability = 'available' | 'catalog-only';

export interface MarketplaceTemplate {
  /** Stable key used by the UI: the catalog path, which is unique. */
  id: string;
  name: string;
  displayName: string;
  description: string;
  namespace: string;
  /** Source repository pinned at a specific commit. */
  source: string;
  commit: string;
  license: string;
  files: string[];
  /** Catalog grouping derived from the pinned source repository. */
  origin: 'coder' | 'registry';
  /**
   * `available` means a template with this name exists in the Coder engine and
   * can be used to create a workspace. `catalog-only` means it is catalogued
   * but not yet pushed to the engine.
   */
  availability: TemplateAvailability;
  /** Present only when the template exists in the engine. */
  coder?: {
    id: string;
    name: string;
    activeVersionId: string;
    organizationId: string;
    organizationName: string;
    activeUserCount: number;
    buildTimeStats?: CoderTemplate['build_time_stats'];
  };
}

export interface MarketplaceCatalog {
  templates: MarketplaceTemplate[];
  modules: CatalogUnit[];
  counts: {
    total: number;
    available: number;
    catalogOnly: number;
    modules: number;
  };
  sources: Record<string, CatalogSourcePin>;
}

// ---------------------------------------------------------------------------
// Engine connection state (Render cold-start awareness)
// ---------------------------------------------------------------------------

export type EngineConnectionState = 'connected' | 'waking' | 'unavailable';

export interface EngineStatus {
  state: EngineConnectionState;
  /** Round-trip time of the successful probe, in milliseconds. */
  latencyMs: number | null;
  /** How long the engine took to answer while waking, in milliseconds. */
  wakeMs: number | null;
  version: string | null;
  coderConfigured: boolean;
  /** Registered provisioners: what actually executes a workspace build. */
  provisionerCount: number;
  /** Read-only counts of Coder provisioner jobs by their official status. */
  provisionerJobCounts: Partial<
    Record<'pending' | 'running' | 'succeeded' | 'canceling' | 'canceled' | 'failed', number>
  >;
  /** Templates present in the engine (not the catalog). */
  templateCount: number;
  checkedAt: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Workspace creation request/response
// ---------------------------------------------------------------------------

export interface CreateWorkspaceInput {
  templateName: string;
  workspaceName: string;
}

export interface CreateWorkspaceResult {
  workspace: CoderWorkspace;
}

export type WorkspaceAction = 'start' | 'stop' | 'restart' | 'delete';
