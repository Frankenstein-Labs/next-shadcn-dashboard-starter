'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

import { marketplaceQueries } from '../api/queries';
import type { MarketplaceTemplate } from '../api/types';
import CreateWorkspaceDialog from './create-workspace-dialog';
import EngineStatusBanner from './engine-status-banner';
import TemplateCard from './template-card';
import TemplateDetailDialog from './template-detail-dialog';
import WorkspacesView from './workspaces-view';

type AvailabilityFilter = 'all' | 'available' | 'catalog-only';

/**
 * Marketplace: browse the Frankenstein-Labs catalog and provision workspaces on
 * the Coder engine.
 *
 * The two numbers that matter are reported separately and never conflated:
 * the catalog size (everything catalogued, from the pinned sources) and the
 * engine inventory (templates actually pushed to Coder, which are the only ones
 * that can be launched).
 */
export default function MarketplaceView() {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery(
    marketplaceQueries.catalog()
  );
  const [search, setSearch] = React.useState('');
  const [origin, setOrigin] = React.useState<'all' | 'coder' | 'registry'>('all');
  const [availability, setAvailability] = React.useState<AvailabilityFilter>('all');
  const [selected, setSelected] = React.useState<MarketplaceTemplate | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const templates = React.useMemo(() => data?.templates ?? [], [data]);

  const filtered = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    return templates.filter((template) => {
      if (origin !== 'all' && template.origin !== origin) return false;
      if (availability !== 'all' && template.availability !== availability) return false;
      if (!needle) return true;
      return (
        template.name.toLowerCase().includes(needle) ||
        template.displayName.toLowerCase().includes(needle) ||
        template.description.toLowerCase().includes(needle) ||
        template.namespace.toLowerCase().includes(needle)
      );
    });
  }, [templates, search, origin, availability]);

  const handleUse = (template: MarketplaceTemplate) => {
    setSelected(template);
    setDialogOpen(true);
  };

  const handleDetails = (template: MarketplaceTemplate) => {
    setSelected(template);
    setDetailsOpen(true);
  };

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <EngineStatusBanner />

      {isPending && (
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Skeleton key={index} className='h-56 w-full rounded-xl' />
          ))}
        </div>
      )}

      {isError && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <Icons.warning />
            </EmptyMedia>
            <EmptyTitle>Could not load the marketplace</EmptyTitle>
            <EmptyDescription>
              {error instanceof Error ? error.message : 'Unknown error'}
            </EmptyDescription>
          </EmptyHeader>
          <Button variant='outline' onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? <Icons.spinner className='animate-spin' /> : <Icons.arrowRight />}
            Retry
          </Button>
        </Empty>
      )}

      {data && (
        <>
          <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
            <StatCard label='Catalogued templates' value={data.counts.total} />
            <StatCard
              label='Available in engine'
              value={data.counts.available}
              tone={data.counts.available > 0 ? 'default' : 'muted'}
            />
            <StatCard label='Catalog only' value={data.counts.catalogOnly} tone='muted' />
            <StatCard label='Modules' value={data.counts.modules} />
          </div>

          <Tabs defaultValue='templates'>
            <TabsList>
              <TabsTrigger value='templates'>
                Templates
                <Badge variant='outline'>{data.counts.total}</Badge>
              </TabsTrigger>
              <TabsTrigger value='workspaces'>
                Workspaces
                <Icons.workspace className='size-3.5' />
              </TabsTrigger>
              <TabsTrigger value='modules'>
                Modules
                <Badge variant='outline'>{data.counts.modules}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value='templates' className='mt-4 flex flex-col gap-4'>
              <div className='flex flex-wrap items-center gap-2'>
                <div className='relative min-w-56 flex-1'>
                  <Icons.search className='text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2' />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder='Search templates, namespaces, descriptions…'
                    className='pl-8'
                    aria-label='Search templates'
                  />
                </div>
                <FilterButton
                  active={availability === 'all'}
                  onClick={() => setAvailability('all')}
                >
                  All
                </FilterButton>
                <FilterButton
                  active={availability === 'available'}
                  onClick={() => setAvailability('available')}
                >
                  Available
                </FilterButton>
                <FilterButton
                  active={availability === 'catalog-only'}
                  onClick={() => setAvailability('catalog-only')}
                >
                  Catalog only
                </FilterButton>
                <span className='bg-border mx-1 hidden h-6 w-px sm:block' />
                <FilterButton active={origin === 'all'} onClick={() => setOrigin('all')}>
                  All sources
                </FilterButton>
                <FilterButton active={origin === 'coder'} onClick={() => setOrigin('coder')}>
                  coder/coder
                </FilterButton>
                <FilterButton active={origin === 'registry'} onClick={() => setOrigin('registry')}>
                  coder/registry
                </FilterButton>
              </div>

              {filtered.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant='icon'>
                      <Icons.search />
                    </EmptyMedia>
                    <EmptyTitle>No templates match</EmptyTitle>
                    <EmptyDescription>
                      Adjust the search text or filters to see more of the catalog.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                  {filtered.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onUse={handleUse}
                      onDetails={handleDetails}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value='workspaces' className='mt-4'>
              <WorkspacesView />
            </TabsContent>

            <TabsContent value='modules' className='mt-4 flex flex-col gap-3'>
              <p className='text-muted-foreground text-sm'>
                Modules are reusable Coder modules pinned to the same source commits. They are
                installed by templates, not launched directly.
              </p>
              <div className='grid gap-2 md:grid-cols-2 xl:grid-cols-3'>
                {data.modules.map((module) => (
                  <div
                    key={module.path}
                    className='flex items-start justify-between gap-3 rounded-lg border p-3'
                  >
                    <div className='min-w-0'>
                      <p className='truncate text-sm font-medium'>{module.name}</p>
                      <p className='text-muted-foreground truncate text-xs'>
                        {module.namespace} · {module.license}
                      </p>
                    </div>
                    <Button
                      variant='ghost'
                      size='icon-sm'
                      aria-label={`Open source for ${module.name}`}
                      render={
                        <a
                          href={module.source}
                          target='_blank'
                          rel='noreferrer noopener'
                          aria-label={`Open source for ${module.name}`}
                        />
                      }
                    >
                      <Icons.externalLink />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <CreateWorkspaceDialog
            template={selected}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
          <TemplateDetailDialog
            template={selected}
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
            onUse={handleUse}
          />
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = 'default'
}: {
  label: string;
  value: number;
  tone?: 'default' | 'muted';
}) {
  return (
    <div className='rounded-xl border p-4'>
      <p className='text-muted-foreground text-xs'>{label}</p>
      <p
        className={cn(
          'mt-1 text-2xl font-semibold tabular-nums',
          tone === 'muted' && 'text-muted-foreground'
        )}
      >
        {value}
      </p>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button variant={active ? 'secondary' : 'ghost'} size='sm' onClick={onClick}>
      {children}
    </Button>
  );
}
