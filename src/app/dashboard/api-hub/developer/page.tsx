import { CategoryPage } from '../category-pages';
export const metadata = { title: 'Dashboard: Developer Hub' };
export default function Page() {
  return (
    <CategoryPage
      title='Developer Hub'
      description='Registre, CDN et outils de développement documentés.'
      category='Developer Hub'
    />
  );
}
