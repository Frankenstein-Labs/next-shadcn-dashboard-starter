'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

import type { MarketplaceTemplate } from '../api/types';

interface TemplateDetailDialogProps {
  template: MarketplaceTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUse: (template: MarketplaceTemplate) => void;
}

export default function TemplateDetailDialog({
  template,
  open,
  onOpenChange,
  onUse
}: TemplateDetailDialogProps) {
  if (!template) return null;

  const available = template.availability === 'available';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader>
          <div className='flex items-start justify-between gap-3 pr-6'>
            <div>
              <DialogTitle>{template.displayName}</DialogTitle>
              <DialogDescription className='mt-1 font-mono'>{template.name}</DialogDescription>
            </div>
            <Badge variant={available ? 'default' : 'outline'}>
              {available ? 'Available in Coder' : 'Catalog only'}
            </Badge>
          </div>
        </DialogHeader>

        <div className='flex flex-col gap-4'>
          <p className='text-muted-foreground text-sm'>
            {template.description || 'No description provided by the source catalog.'}
          </p>

          <dl className='grid grid-cols-2 gap-3 text-sm'>
            <Detail label='Namespace' value={template.namespace} />
            <Detail label='Origin' value={template.origin} />
            <Detail label='License' value={template.license} />
            <Detail label='Catalog commit' value={template.commit.slice(0, 12)} mono />
            {template.coder && (
              <>
                <Detail label='Coder template ID' value={template.coder.id} mono />
                <Detail label='Active version ID' value={template.coder.activeVersionId} mono />
              </>
            )}
          </dl>

          <div>
            <p className='mb-2 text-sm font-medium'>Indexed files</p>
            <div className='bg-muted/40 max-h-32 overflow-y-auto rounded-md border p-2 font-mono text-xs'>
              {template.files.map((file) => (
                <div key={file} className='text-muted-foreground truncate py-0.5'>
                  {file}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
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
          <Button
            disabled={!available}
            onClick={() => {
              onOpenChange(false);
              onUse(template);
            }}
          >
            <Icons.add />
            Create workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className='min-w-0'>
      <dt className='text-muted-foreground text-xs'>{label}</dt>
      <dd className={mono ? 'truncate font-mono text-xs' : 'truncate'}>{value}</dd>
    </div>
  );
}
