import 'server-only';

import { createHash } from 'node:crypto';

import { coderRequest, UpstreamError } from './upstream';
import type { CoderWorkspace, CreateWorkspaceInput, WorkspaceAction } from './types';

/**
 * Workspace operations against the Coder engine.
 *
 * The Frankenstein-Labs API proxies Coder with a single shared session token, so
 * per-user isolation is enforced here, on the server: every workspace is owned
 * by a deterministic Coder user derived from the authenticated Clerk user id,
 * and reads/actions are restricted to that owner. A user can therefore never
 * list, start, stop, restart or delete another user's workspace.
 */

const USERNAME_PREFIX = 'fl-';

/** Deterministic, collision-resistant Coder username for a Clerk user id. */
export function coderUsernameFor(clerkUserId: string): string {
  const digest = createHash('sha256').update(clerkUserId).digest('hex').slice(0, 16);
  return `${USERNAME_PREFIX}${digest}`;
}

/** Coder template names must be lowercase alphanumeric with hyphens/underscores. */
export function slugifyWorkspaceName(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

interface CoderUser {
  id: string;
  username: string;
  organization_ids?: string[];
}

interface CoderOrganization {
  id: string;
  name: string;
  is_default: boolean;
}

/**
 * Resolve the id of the organization new users are placed in.
 *
 * Coder requires every user to belong to at least one organization, so a user
 * created for a dashboard account must be added to the default organization
 * before it can own workspaces.
 */
export async function getDefaultOrganizationId(): Promise<string> {
  const response = await coderRequest<CoderOrganization[] | null>('/api/v2/organizations');
  const organizations = Array.isArray(response.data) ? response.data : [];
  const organization = organizations.find((candidate) => candidate.is_default) ?? organizations[0];
  if (!organization) {
    throw new UpstreamError('No organization is available in the Coder engine', 503);
  }
  return organization.id;
}

/**
 * Ensure a Coder account exists for this Clerk user, then return its id.
 *
 * The account is created without a usable password: it exists only to own
 * workspaces provisioned through this dashboard, and authentication always goes
 * through Clerk. The shared Coder token is used for the admin call and never
 * leaves the server.
 */
export async function ensureCoderUser(clerkUserId: string): Promise<string> {
  const username = coderUsernameFor(clerkUserId);

  const existing = await coderRequest<{ users?: CoderUser[] } | CoderUser[]>(
    `/api/v2/users?q=${encodeURIComponent(`username:${username}`)}`
  ).catch(() => null);

  const list: CoderUser[] = Array.isArray(existing?.data)
    ? existing!.data
    : ((existing?.data as { users?: CoderUser[] } | null)?.users ?? []);
  const found = list.find((user) => user.username === username);
  if (found) return found.id;

  const organizationId = await getDefaultOrganizationId();

  try {
    const created = await coderRequest<CoderUser>('/api/v2/users', {
      method: 'POST',
      body: {
        username,
        name: `Frankenstein-Labs user ${username}`,
        email: `${username}@users.frankenstein-labs.invalid`,
        // 32 random hex chars; the account is never used to sign in directly.
        password: createHash('sha256').update(`${clerkUserId}:${username}:fl`).digest('hex'),
        login_type: 'password',
        organization_ids: [organizationId]
      }
    });
    return created.data.id;
  } catch (error) {
    if (error instanceof UpstreamError && error.status === 409) {
      // Lost a race with a concurrent request; re-read.
      const retry = await coderRequest<CoderUser[] | { users?: CoderUser[] }>(
        `/api/v2/users?q=${encodeURIComponent(`username:${username}`)}`
      );
      const retryList: CoderUser[] = Array.isArray(retry.data)
        ? retry.data
        : (retry.data.users ?? []);
      const retryFound = retryList.find((user) => user.username === username);
      if (retryFound) return retryFound.id;
    }
    throw error;
  }
}

/** List workspaces owned by a Coder user. */
export async function listUserWorkspaces(userId: string): Promise<CoderWorkspace[]> {
  const response = await coderRequest<{ workspaces?: CoderWorkspace[]; count?: number }>(
    `/api/v2/workspaces?q=${encodeURIComponent(`owner:${userId}`)}`
  );
  return response.data.workspaces ?? [];
}

async function assertOwnership(userId: string, workspaceId: string): Promise<CoderWorkspace> {
  const workspace = await coderRequest<CoderWorkspace>(`/api/v2/workspaces/${workspaceId}`);
  const ownerId = (workspace.data as CoderWorkspace & { owner_id?: string }).owner_id;
  const ownedByUser = ownerId
    ? ownerId === userId
    : (await listUserWorkspaces(userId)).some((candidate) => candidate.id === workspaceId);
  if (!ownedByUser) {
    throw new UpstreamError('Workspace not found', 404);
  }
  return workspace.data;
}

export interface ProvisionResult {
  workspace: CoderWorkspace;
  /** The build that was queued, used by the UI to follow real progress. */
  buildId: string;
}

/** Create a workspace for the given user from a template that exists in the engine. */
export async function createUserWorkspace(
  userId: string,
  input: CreateWorkspaceInput
): Promise<ProvisionResult> {
  const workspaceName = slugifyWorkspaceName(input.workspaceName);
  if (!workspaceName) {
    throw new UpstreamError('A valid workspace name is required', 400);
  }

  const templates = await coderRequest<{ id: string; name: string }[]>('/api/v2/templates');
  const template = (Array.isArray(templates.data) ? templates.data : []).find(
    (candidate) => candidate.name === input.templateName
  );
  if (!template) {
    throw new UpstreamError(
      `Template "${input.templateName}" is not available in the Coder engine`,
      404
    );
  }

  // Coder treats template_id and template_version_id as mutually exclusive
  // (validate:"required_without=...,excluded_with=..."), so only template_id is
  // sent; Coder resolves the template's active version itself.
  const created = await coderRequest<CoderWorkspace>(`/api/v2/users/${userId}/workspaces`, {
    method: 'POST',
    body: {
      name: workspaceName,
      template_id: template.id
    }
  });
  return { workspace: created.data, buildId: created.data.latest_build.id };
}

/** Apply a supported lifecycle action to a workspace owned by the user. */
export async function actOnUserWorkspace(
  userId: string,
  workspaceId: string,
  action: WorkspaceAction
): Promise<CoderWorkspace> {
  const workspace = await assertOwnership(userId, workspaceId);

  if (action === 'delete') {
    await coderRequest(`/api/v2/workspaces/${workspaceId}`, {
      method: 'DELETE',
      body: { orphan: false }
    });
    return workspace;
  }

  const buildTransition = async (transition: 'start' | 'stop') => {
    await coderRequest(`/api/v2/workspaces/${workspaceId}/builds`, {
      method: 'POST',
      body: { transition }
    });
  };

  // Coder has no atomic restart: a restart is a stop build followed by a start
  // build. Coder serialises builds per workspace, so queuing both back-to-back is
  // safe; the UI follows the resulting build states.
  if (action === 'restart') {
    await buildTransition('stop');
    await buildTransition('start');
  } else {
    await buildTransition(action);
  }

  // Return the refreshed workspace so the caller can poll the real build state.
  const refreshed = await coderRequest<CoderWorkspace>(`/api/v2/workspaces/${workspaceId}`);
  return refreshed.data;
}
