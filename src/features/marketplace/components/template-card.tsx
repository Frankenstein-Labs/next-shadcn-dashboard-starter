'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';

import type { MarketplaceTemplate } from '../api/types';

interface TemplateCardProps {
  template: MarketplaceTemplate;
  onUse: (template: MarketplaceTemplate) => void;
  onDetails: (template: MarketplaceTemplate) => void;
}

/**
 * One catalog template. Availability is shown explicitly: `Available` means the
 * template exists in the Coder engine and a workspace can be created from it;
 * `Catalog only` means it is catalogued but has not been pushed to the engine.
 */
export default function TemplateCard({ template, onUse, onDetails }: TemplateCardProps) {
  const available = template.availability === 'available';

  return (
    <Card className='flex flex-col'>
      <CardHeader>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <CardTitle className='truncate text-base'>{template.displayName}</CardTitle>
            <CardDescription className='truncate font-mono text-xs'>
              {template.name}
            </CardDescription>
          </div>
          <Badge variant={available ? 'default' : 'outline'}>
            {available ? <Icons.circleCheck /> : <Icons.lock />}
            {available ? 'Available' : 'Catalog only'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className='flex flex-1 flex-col gap-3'>
        <p className='text-muted-foreground line-clamp-3 text-sm'>
          {template.description || 'No description provided.'}
        </p>

        <div className='text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs'>
          <span className='inline-flex items-center gap-1'>
            <Icons.workspace className='size-3.5' />
            {template.namespace}
          </span>
          <span className='inline-flex items-center gap-1'>
            <Icons.badgeCheck className='size-3.5' />
            {template.license}
          </span>
          <span className='inline-flex items-center gap-1'>
            <Icons.code className='size-3.5' />
            {template.origin}
          </span>
        </div>

        <div className='mt-auto flex items-center justify-between gap-2 pt-2'>
          <span className='text-muted-foreground font-mono text-[0.7rem]'>
            {template.commit.slice(0, 12)}
          </span>
          <div className='flex gap-2'>
            <Button variant='ghost' size='sm' onClick={() => onDetails(template)}>
              Details
            </Button>
            <Button
              variant='ghost'
              size='sm'
              render={
                <a
                  href={template.source}
                  target='_blank'
                  rel='noreferrer noopener'
                  aria-label={`Open source for ${template.name}`}
                />
              }
            >
              <Icons.externalLink />
              Source
            </Button>
            <Button size='sm' disabled={!available} onClick={() => onUse(template)}>
              <Icons.add />
              Create workspace
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
