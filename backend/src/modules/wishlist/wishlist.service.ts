import { db } from '../../utils/database';
import { AppError } from '../../middleware/error.middleware';

export class WishlistService {
  async getWishlist(userId: number) {
    return db.query(`
      SELECT
        w.id, w.product_id, w.added_at,
        p.name, p.slug, p.price, p.mrp, p.primary_image,
        p.rating_avg, p.rating_count, p.is_bestseller, p.is_new,
        p.stock_quantity, p.status as product_status,
        c.name as category_name, c.slug as category_slug
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE w.user_id = ?
      ORDER BY w.added_at DESC
    `, [userId]);
  }

  async toggle(userId: number, productId: number) {
    const product = await db.queryOne('SELECT id FROM products WHERE id = ? AND status = "active"', [productId]);
    if (!product) throw new AppError('Product not found', 404);

    const existing = await db.queryOne<any>(
      'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existing) {
      await db.query('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [userId, productId]);
      await db.query('UPDATE products SET wishlist_count = GREATEST(0, wishlist_count - 1) WHERE id = ?', [productId]);
      return { wishlisted: false };
    }

    try {
      await db.query('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)', [userId, productId]);
    } catch (err: any) {
      // Two concurrent clicks both miss the SELECT above and race the
      // UNIQUE(user_id, product_id) constraint — treat the loser as a no-op
      // instead of a raw 500.
      if (err?.code === 'ER_DUP_ENTRY') return { wishlisted: true };
      throw err;
    }
    await db.query('UPDATE products SET wishlist_count = wishlist_count + 1 WHERE id = ?', [productId]);
    return { wishlisted: true };
  }

  async remove(userId: number, productId: number) {
    const result = await db.query<any>('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [userId, productId]);
    if (result.affectedRows > 0) {
      await db.query('UPDATE products SET wishlist_count = GREATEST(0, wishlist_count - 1) WHERE id = ?', [productId]);
    }
  }

  async isWishlisted(userId: number, productId: number) {
    const row = await db.queryOne('SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?', [userId, productId]);
    return !!row;
  }

  async clear(userId: number) {
    const items = await db.query<any[]>('SELECT product_id FROM wishlists WHERE user_id = ?', [userId]);
    await db.query('DELETE FROM wishlists WHERE user_id = ?', [userId]);
    for (const item of items) {
      await db.query('UPDATE products SET wishlist_count = GREATEST(0, wishlist_count - 1) WHERE id = ?', [item.product_id]);
    }
  }
}
