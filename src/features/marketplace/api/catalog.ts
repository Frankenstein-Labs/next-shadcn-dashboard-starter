import 'server-only';

import { coderGet, upstreamGet } from './upstream';
import type {
  Catalog,
  CatalogUnit,
  CoderTemplate,
  MarketplaceCatalog,
  MarketplaceTemplate
} from './types';

/**
 * Merge the Frankenstein-Labs catalog with the templates that actually exist in
 * the Coder engine.
 *
 * The catalog is the source of truth for what *can* be offered (name,
 * description, provenance, license). The engine is the source of truth for what
 * *can actually be launched*: a workspace can only be created from a template
 * that has been pushed to Coder. Nothing is fabricated here — a template is
 * marked `available` only when the engine reports a template with the same
 * name, and `catalog-only` otherwise.
 */

const registryMarker = '/coder/registry/';

function deriveOrigin(source: string): MarketplaceTemplate['origin'] {
  return source.includes(registryMarker) ? 'registry' : 'coder';
}

function toDisplayName(name: string) {
  return name
    .split(/[-_/]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function mergeCatalog(
  catalog: Catalog,
  engineTemplates: CoderTemplate[]
): MarketplaceCatalog {
  const byName = new Map<string, CoderTemplate>();
  for (const template of engineTemplates) {
    byName.set(template.name, template);
  }

  const templates: MarketplaceTemplate[] = catalog.templates.map((unit: CatalogUnit) => {
    const engine = byName.get(unit.name);
    return {
      id: unit.path,
      name: unit.name,
      displayName: toDisplayName(unit.name),
      description: unit.description,
      namespace: unit.namespace,
      source: unit.source,
      commit: unit.commit,
      license: unit.license,
      files: unit.files,
      origin: deriveOrigin(unit.source),
      availability: engine ? 'available' : 'catalog-only',
      coder: engine
        ? {
            id: engine.id,
            name: engine.name,
            activeVersionId: engine.active_version_id,
            organizationId: engine.organization_id,
            organizationName: engine.organization_name,
            activeUserCount: engine.active_user_count,
            buildTimeStats: engine.build_time_stats
          }
        : undefined
    };
  });

  const available = templates.filter((template) => template.availability === 'available').length;

  return {
    templates,
    modules: catalog.modules,
    counts: {
      total: templates.length,
      available,
      catalogOnly: templates.length - available,
      modules: catalog.modules.length
    },
    sources: catalog.sources
  };
}

/** Load the catalog from the Frankenstein-Labs API and merge it with the engine. */
export async function loadMarketplace(): Promise<MarketplaceCatalog> {
  const [catalog, engineTemplates] = await Promise.all([
    upstreamGet<Catalog>('/api/catalog'),
    coderGet<CoderTemplate[] | null>('/api/v2/templates').catch(() => [] as CoderTemplate[])
  ]);

  return mergeCatalog(catalog.data, Array.isArray(engineTemplates) ? engineTemplates : []);
}

/** Load a single merged template by its catalog path id. */
export async function loadMarketplaceTemplate(id: string): Promise<MarketplaceTemplate | null> {
  const marketplace = await loadMarketplace();
  return marketplace.templates.find((template) => template.id === id) ?? null;
}
