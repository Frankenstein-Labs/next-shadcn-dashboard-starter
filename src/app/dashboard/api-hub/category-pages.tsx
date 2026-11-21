import { auth } from '@clerk/nextjs/server';
import PageContainer from '@/components/layout/page-container';
import ApiHubView from '@/features/api-hub/components/api-hub-view';
import type { ProviderCategory } from '@/features/api-hub/api/types';

export async function CategoryPage({
  title,
  description,
  category
}: {
  title: string;
  description: string;
  category: ProviderCategory;
}) {
  await auth.protect();
  return (
    <PageContainer pageTitle={title} pageDescription={description}>
      <ApiHubView category={category} />
    </PageContainer>
  );
}
