import { CategoryPage } from '../category-pages';
export const metadata = { title: 'Dashboard: Agent Hub' };
export default function Page() {
  return (
    <CategoryPage
      title='Agent Hub'
      description='Services d’agents et d’automatisation connectables côté serveur.'
      category='Agent Hub'
    />
  );
}
