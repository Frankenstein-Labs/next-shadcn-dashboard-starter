import { auth } from '@clerk/nextjs/server';

import PageContainer from '@/components/layout/page-container';
import MarketplaceView from '@/features/marketplace/components/marketplace-view';
import { marketplaceInfoContent } from '@/config/marketplace-infoconfig';

export const metadata = {
  title: 'Dashboard: Marketplace'
};

export default async function Page() {
  await auth.protect();

  return (
    <PageContainer
      pageTitle='Marketplace'
      pageDescription='Browse the Frankenstein-Labs template catalog and provision workspaces on the Coder engine.'
      infoContent={marketplaceInfoContent}
    >
      <MarketplaceView />
    </PageContainer>
  );
}
