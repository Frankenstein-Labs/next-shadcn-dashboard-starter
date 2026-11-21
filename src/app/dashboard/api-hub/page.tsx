import { auth } from '@clerk/nextjs/server';
import PageContainer from '@/components/layout/page-container';
import ApiHubView from '@/features/api-hub/components/api-hub-view';

export const metadata = { title: 'Dashboard: API Hub' };

export default async function Page() {
  await auth.protect();
  return (
    <PageContainer
      pageTitle='API Hub'
      pageDescription='Découvrez, configurez et testez les fournisseurs connectés à Aetheris Cloud.'
    >
      <ApiHubView />
    </PageContainer>
  );
}
