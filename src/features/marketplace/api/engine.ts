import 'server-only';

import { coderGet, upstreamGet, UpstreamError } from './upstream';
import type { EngineStatus } from './types';

interface BuildInfo {
  version: string;
}

interface Organization {
  id: string;
  name: string;
  is_default: boolean;
}

interface ProvisionerDaemon {
  id: string;
  status: string;
  tags?: Record<string, string>;
}

type ProvisionerJobStatus =
  | 'pending'
  | 'running'
  | 'succeeded'
  | 'canceling'
  | 'canceled'
  | 'failed';

interface ProvisionerJob {
  status: ProvisionerJobStatus;
}

/**
 * Count the provisioner daemons registered with the engine.
 *
 * Provisioner daemons are org-scoped in Coder's API, so the default organization
 * is resolved first. A daemon being present means the engine can *execute* a
 * build; it does not by itself prove a compute backend exists, which is why the
 * count is reported as a fact and never turned into a success claim.
 */
async function countProvisioners(): Promise<number> {
  const orgs = await coderGet<Organization[] | null>('/api/v2/organizations');
  const list = Array.isArray(orgs) ? orgs : [];
  const defaultOrg = list.find((org) => org.is_default) ?? list[0];
  if (!defaultOrg) return 0;

  const daemons = await coderGet<ProvisionerDaemon[] | null>(
    `/api/v2/organizations/${defaultOrg.id}/provisionerdaemons`
  );
  return Array.isArray(daemons) ? daemons.length : 0;
}

/**
 * Read the latest provisioner jobs without mutating Coder state.
 *
 * This deliberately reports counts instead of declaring the compute backend
 * healthy: a running daemon can still be unable to create a workspace on the
 * configured Docker/Kubernetes/VM backend.
 */
async function countProvisionerJobs(): Promise<Partial<Record<ProvisionerJobStatus, number>>> {
  const orgs = await coderGet<Organization[] | null>('/api/v2/organizations');
  const list = Array.isArray(orgs) ? orgs : [];
  const defaultOrg = list.find((org) => org.is_default) ?? list[0];
  if (!defaultOrg) return {};

  const jobs = await coderGet<ProvisionerJob[] | null>(
    `/api/v2/organizations/${defaultOrg.id}/provisionerjobs?limit=100`
  );
  const counts: Partial<Record<ProvisionerJobStatus, number>> = {};
  for (const job of Array.isArray(jobs) ? jobs : []) {
    counts[job.status] = (counts[job.status] ?? 0) + 1;
  }
  return counts;
}

/**
 * Probe the engine and report how long it took to answer.
 *
 * The Frankenstein-Labs API and Coder run as Render services. Free instances
 * spin down after a period of inactivity and need tens of seconds to wake. The
 * measured round-trip is what the UI reports as the wake-up time — it is a real
 * measurement, never a fixed guess, and it is kept separate from workspace build
 * time.
 */
export async function probeEngine(): Promise<EngineStatus> {
  const checkedAt = new Date().toISOString();
  const startedAt = Date.now();

  try {
    // The API service reports whether it can reach Coder at all.
    const health = await upstreamGet<{ ok: boolean; coderConfigured: boolean }>('/healthz');
    if (!health.data.coderConfigured) {
      return {
        state: 'unavailable',
        latencyMs: health.durationMs,
        wakeMs: null,
        version: null,
        coderConfigured: false,
        provisionerCount: 0,
        provisionerJobCounts: {},
        templateCount: 0,
        checkedAt,
        error: 'The engine is reachable but has no Coder upstream configured.'
      };
    }

    const [info, provisionerCount, provisionerJobCounts, templates] = await Promise.all([
      coderGet<BuildInfo>('/api/v2/buildinfo'),
      countProvisioners().catch(() => 0),
      countProvisionerJobs().catch(() => ({})),
      coderGet<unknown[] | null>('/api/v2/templates').catch(() => [] as unknown[])
    ]);
    const totalMs = Date.now() - startedAt;

    return {
      state: 'connected',
      latencyMs: totalMs,
      wakeMs: null,
      version: info.version ?? null,
      coderConfigured: true,
      provisionerCount,
      provisionerJobCounts,
      templateCount: Array.isArray(templates) ? templates.length : 0,
      checkedAt
    };
  } catch (error) {
    const totalMs = Date.now() - startedAt;
    const unreachable = error instanceof UpstreamError ? error.unreachable : true;
    return {
      state: unreachable ? 'waking' : 'unavailable',
      latencyMs: null,
      wakeMs: unreachable ? totalMs : null,
      version: null,
      coderConfigured: false,
      provisionerCount: 0,
      provisionerJobCounts: {},
      templateCount: 0,
      checkedAt,
      error: error instanceof Error ? error.message : 'Engine probe failed'
    };
  }
}
