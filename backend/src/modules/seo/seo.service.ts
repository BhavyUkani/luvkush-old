import { db } from '../../utils/database';

export interface SeoMeta {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
}

export class SeoService {
  async getMetaForPath(urlPath: string): Promise<SeoMeta | null> {
    if (urlPath.startsWith('/products/')) {
      const slug = urlPath.replace('/products/', '');
      const product = await db.queryOne<any>(
        'SELECT name, seo_title, seo_description, seo_keywords, primary_image FROM products WHERE slug = ? AND status = "active"',
        [slug]
      );
      if (product) {
        return {
          title: product.seo_title || product.name,
          description: product.seo_description,
          keywords: product.seo_keywords,
          image: product.primary_image,
        };
      }
    }

    if (urlPath.startsWith('/collections/')) {
      const slug = urlPath.replace('/collections/', '');
      // Uses `status`, matching CategoryService's own active-category
      // filter — the old inline route checked the categories.is_active
      // flag instead, a second column tracking the same thing that had
      // drifted out of sync with the column category.service.ts actually
      // maintains.
      const category = await db.queryOne<any>(
        "SELECT name, meta_title, meta_description FROM categories WHERE slug = ? AND status = 'active'",
        [slug]
      );
      if (category) {
        return {
          title: category.meta_title || category.name,
          description: category.meta_description,
        };
      }
    }

    return null;
  }
}
