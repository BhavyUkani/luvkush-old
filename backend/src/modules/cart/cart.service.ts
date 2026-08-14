import { db } from '../../utils/database';
import { AppError } from '../../middleware/error.middleware';
import { CouponService } from '../coupon/coupon.service';

const couponService = new CouponService();

export class CartService {
  async getOrCreate(userId: number) {
    let cart = await db.queryOne<any>('SELECT * FROM carts WHERE user_id = ?', [userId]);
    if (!cart) {
      // Two concurrent first-time requests (cart + wishlist loads fire
      // together on login) can both miss the SELECT above and race the
      // UNIQUE(user_id) constraint — fall back to re-reading on conflict
      // instead of surfacing a raw ER_DUP_ENTRY 500.
      try {
        const result = await db.query<any>('INSERT INTO carts (user_id) VALUES (?)', [userId]);
        cart = { id: result.insertId, user_id: userId };
      } catch (err: any) {
        if (err?.code === 'ER_DUP_ENTRY') {
          cart = await db.queryOne<any>('SELECT * FROM carts WHERE user_id = ?', [userId]);
        } else {
          throw err;
        }
      }
    }
    return cart;
  }

  async getCart(userId: number) {
    const cart = await this.getOrCreate(userId);

    const items = await db.query(`
      SELECT
        ci.id, ci.product_id, ci.variant_id, ci.quantity,
        p.name, p.slug, p.price, p.mrp, p.primary_image, p.stock_quantity,
        p.status as product_status, p.payment_mode, p.advance_amount,
        pv.name as variant_name, pv.value as variant_value,
        pv.price_modifier, pv.stock_quantity as variant_stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_variants pv ON ci.variant_id = pv.id
      WHERE ci.cart_id = ?
      ORDER BY ci.added_at DESC
    `, [cart.id]);

    const summary = this.computeSummary(items as any[]);
    return { cart_id: cart.id, items, ...summary };
  }

  async addItem(userId: number, productId: number, quantity: number, variantId?: number) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      throw new AppError('Quantity must be a whole number between 1 and 50', 400);
    }

    const product = await db.queryOne<any>(
      'SELECT id, price, stock_quantity, status FROM products WHERE id = ? AND status = "active"',
      [productId]
    );
    if (!product) throw new AppError('Product not found or unavailable', 404);

    let availableStock = product.stock_quantity;
    let priceModifier = 0;

    if (variantId) {
      const variant = await db.queryOne<any>(
        'SELECT id, price_modifier, stock_quantity, status FROM product_variants WHERE id = ? AND product_id = ? AND status = "active"',
        [variantId, productId]
      );
      if (!variant) throw new AppError('Product variant not found', 404);
      availableStock = variant.stock_quantity;
      priceModifier = variant.price_modifier || 0;
    }

    if (availableStock < quantity) {
      throw new AppError(`Only ${availableStock} units available`, 400);
    }

    const cart = await this.getOrCreate(userId);

    const existing = await db.queryOne<any>(`
      SELECT id, quantity FROM cart_items
      WHERE cart_id = ? AND product_id = ? AND ${variantId ? 'variant_id = ?' : 'variant_id IS NULL'}
    `, variantId ? [cart.id, productId, variantId] : [cart.id, productId]);

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > availableStock) throw new AppError(`Only ${availableStock} units available`, 400);
      await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existing.id]);
    } else {
      const unitPrice = product.price + priceModifier;
      await db.query(`
        INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, unit_price)
        VALUES (?, ?, ?, ?, ?)
      `, [cart.id, productId, variantId || null, quantity, unitPrice]);
    }

    return this.getCart(userId);
  }

  async updateItem(userId: number, itemId: number, quantity: number) {
    if (!Number.isInteger(quantity)) throw new AppError('Quantity must be a whole number', 400);
    if (quantity > 50) throw new AppError('Quantity must be 50 or fewer', 400);

    const cart = await this.getOrCreate(userId);
    const item = await db.queryOne<any>(
      'SELECT ci.*, p.stock_quantity, pv.stock_quantity as var_stock FROM cart_items ci JOIN products p ON ci.product_id = p.id LEFT JOIN product_variants pv ON ci.variant_id = pv.id WHERE ci.id = ? AND ci.cart_id = ?',
      [itemId, cart.id]
    );
    if (!item) throw new AppError('Cart item not found', 404);

    if (quantity <= 0) {
      await db.query('DELETE FROM cart_items WHERE id = ?', [itemId]);
    } else {
      const stock = item.variant_id ? item.var_stock : item.stock_quantity;
      if (quantity > stock) throw new AppError(`Only ${stock} units available`, 400);
      await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, itemId]);
    }

    return this.getCart(userId);
  }

  async removeItem(userId: number, itemId: number) {
    const cart = await this.getOrCreate(userId);
    const item = await db.queryOne('SELECT id FROM cart_items WHERE id = ? AND cart_id = ?', [itemId, cart.id]);
    if (!item) throw new AppError('Cart item not found', 404);
    await db.query('DELETE FROM cart_items WHERE id = ?', [itemId]);
    return this.getCart(userId);
  }

  async clearCart(userId: number) {
    const cart = await this.getOrCreate(userId);
    await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
  }

  async applyCoupon(userId: number, code: string) {
    // Reuses CouponService's validation (min order amount, per-user usage,
    // active window, usage limit) instead of a second, drifting copy of the
    // same rules — a coupon the cart accepts is guaranteed to also be one
    // order creation will accept (see order.service.createFromCart).
    const cart = await this.getCart(userId);
    const { coupon, discount } = await couponService.validate(code, userId, (cart as any).subtotal);
    return { coupon, discount };
  }

  private computeSummary(items: any[]) {
    const subtotal = items.reduce((sum, item) => {
      const price = item.variant_id ? item.price + (item.price_modifier || 0) : item.price;
      return sum + price * item.quantity;
    }, 0);
    const shipping = subtotal >= 999 ? 0 : 99;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total, item_count: items.length };
  }
}
