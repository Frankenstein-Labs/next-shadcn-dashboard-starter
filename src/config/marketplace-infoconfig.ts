import type { InfobarContent } from '@/components/ui/infobar';

export const marketplaceInfoContent: InfobarContent = {
  title: 'Marketplace',
  sections: [
    {
      title: 'What this is',
      description:
        'The Marketplace lists the templates catalogued by Frankenstein-Labs from the pinned coder/coder and coder/registry sources. Each entry shows the exact commit and license it was imported from, so the provenance is verifiable.',
      links: []
    },
    {
      title: 'Catalogued vs available',
      description:
        'Catalogued templates come from the catalog index. A template is marked Available only when a template with the same name exists in the connected Coder engine; those are the only ones a workspace can be created from. Everything else is catalog only.',
      links: []
    },
    {
      title: 'Workspaces and compute',
      description:
        'Workspaces are provisioned by the Coder engine. A build only produces a usable workspace when a provisioner (a compute backend such as Kubernetes, Docker, or a cloud VM) is registered with the engine. The engine status banner reports the provisioner count, so it is clear whether workspaces can actually run.',
      links: [
        {
          title: 'Coder provisioners',
          url: 'https://coder.com/docs/admin/provisioners'
        }
      ]
    },
    {
      title: 'Cold starts',
      description:
        'The API and Coder run as Render services. Free instances spin down after a period of inactivity and take tens of seconds to answer again; the first request after that shows a measured wake-up time instead of a failure.',
      links: []
    }
  ]
};
