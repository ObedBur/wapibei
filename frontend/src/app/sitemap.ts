import { MetadataRoute } from 'next';
import { getProducts } from '@/features/products/services/product.service';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://wapibei.cd';

  // Static routes
  const routes = ['', '/products', '/cart', '/sellers', '/compare', '/legal', '/privacy', '/terms', '/cookies', '/mentions-legales'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic routes (products)
  const productsRes = await getProducts();
  const productEntries = productsRes.success 
    ? productsRes.data.map((product) => ({
        url: `${baseUrl}/products/${product.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    : [];

  return [...routes, ...productEntries];
}
