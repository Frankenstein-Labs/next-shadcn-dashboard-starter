import { auth } from '@clerk/nextjs/server';
import PageContainer from '@/components/layout/page-container';
import ApiHubView from '@/features/api-hub/components/api-hub-view';

export const metadata = { title: 'Dashboard: API Keys & Providers' };

export default async function Page() {
  await auth.protect();
  return (
    <PageContainer
      pageTitle='API Keys & Providers'
      pageDescription='Gérez les références de configuration sans exposer les secrets au navigateur.'
    >
      <ApiHubView mode='keys' />
    </PageContainer>
  );
}
