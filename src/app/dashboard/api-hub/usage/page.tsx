import { auth } from '@clerk/nextjs/server';
import PageContainer from '@/components/layout/page-container';
import ApiHubView from '@/features/api-hub/components/api-hub-view';

export const metadata = { title: 'Dashboard: Usage & Statistics' };

export default async function Page() {
  await auth.protect();
  return (
    <PageContainer
      pageTitle='Usage & Statistics'
      pageDescription='Suivez les appels, quotas et erreurs lorsque la persistance sera activée.'
    >
      <ApiHubView mode='usage' />
    </PageContainer>
  );
}
