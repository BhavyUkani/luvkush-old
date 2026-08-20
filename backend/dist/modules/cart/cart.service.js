"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const database_1 = require("../../utils/database");
const error_middleware_1 = require("../../middleware/error.middleware");
const coupon_service_1 = require("../coupon/coupon.service");
const business_rules_1 = require("../../config/business-rules");
const couponService = new coupon_service_1.CouponService();
class CartService {
    async getOrCreate(userId) {
        let cart = await database_1.db.queryOne('SELECT * FROM carts WHERE user_id = ?', [userId]);
        if (!cart) {
            // Two concurrent first-time requests (cart + wishlist loads fire
            // together on login) can both miss the SELECT above and race the
            // UNIQUE(user_id) constraint — fall back to re-reading on conflict
            // instead of surfacing a raw ER_DUP_ENTRY 500.
            try {
                const result = await database_1.db.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
                cart = { id: result.insertId, user_id: userId };
            }
            catch (err) {
                if (err?.code === 'ER_DUP_ENTRY') {
                    cart = await database_1.db.queryOne('SELECT * FROM carts WHERE user_id = ?', [userId]);
                }
                else {
                    throw err;
                }
            }
        }
        return cart;
    }
    async getCart(userId) {
        const cart = await this.getOrCreate(userId);
        const items = await database_1.db.query(`
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
        const summary = this.computeSummary(items);
        return { cart_id: cart.id, items, ...summary };
    }
    async addItem(userId, productId, quantity, variantId) {
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
            throw new error_middleware_1.AppError('Quantity must be a whole number between 1 and 50', 400);
        }
        const product = await database_1.db.queryOne('SELECT id, stock_quantity, status FROM products WHERE id = ? AND status = "active"', [productId]);
        if (!product)
            throw new error_middleware_1.AppError('Product not found or unavailable', 404);
        let availableStock = product.stock_quantity;
        if (variantId) {
            const variant = await database_1.db.queryOne('SELECT id, stock_quantity, status FROM product_variants WHERE id = ? AND product_id = ? AND status = "active"', [variantId, productId]);
            if (!variant)
                throw new error_middleware_1.AppError('Product variant not found', 404);
            availableStock = variant.stock_quantity;
        }
        if (availableStock < quantity) {
            throw new error_middleware_1.AppError(`Only ${availableStock} units available`, 400);
        }
        const cart = await this.getOrCreate(userId);
        const existing = await database_1.db.queryOne(`
      SELECT id, quantity FROM cart_items
      WHERE cart_id = ? AND product_id = ? AND ${variantId ? 'variant_id = ?' : 'variant_id IS NULL'}
    `, variantId ? [cart.id, productId, variantId] : [cart.id, productId]);
        if (existing) {
            const newQty = existing.quantity + quantity;
            if (newQty > availableStock)
                throw new error_middleware_1.AppError(`Only ${availableStock} units available`, 400);
            await database_1.db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existing.id]);
        }
        else {
            // Price is intentionally not stored here — getCart() always joins the
            // live product/variant price, so a cart reflects current pricing
            // rather than a stale snapshot from whenever the item was added.
            await database_1.db.query(`
        INSERT INTO cart_items (cart_id, product_id, variant_id, quantity)
        VALUES (?, ?, ?, ?)
      `, [cart.id, productId, variantId || null, quantity]);
        }
        return this.getCart(userId);
    }
    async updateItem(userId, itemId, quantity) {
        if (!Number.isInteger(quantity))
            throw new error_middleware_1.AppError('Quantity must be a whole number', 400);
        if (quantity > 50)
            throw new error_middleware_1.AppError('Quantity must be 50 or fewer', 400);
        const cart = await this.getOrCreate(userId);
        const item = await database_1.db.queryOne('SELECT ci.*, p.stock_quantity, pv.stock_quantity as var_stock FROM cart_items ci JOIN products p ON ci.product_id = p.id LEFT JOIN product_variants pv ON ci.variant_id = pv.id WHERE ci.id = ? AND ci.cart_id = ?', [itemId, cart.id]);
        if (!item)
            throw new error_middleware_1.AppError('Cart item not found', 404);
        if (quantity <= 0) {
            await database_1.db.query('DELETE FROM cart_items WHERE id = ?', [itemId]);
        }
        else {
            const stock = item.variant_id ? item.var_stock : item.stock_quantity;
            if (quantity > stock)
                throw new error_middleware_1.AppError(`Only ${stock} units available`, 400);
            await database_1.db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, itemId]);
        }
        return this.getCart(userId);
    }
    async removeItem(userId, itemId) {
        const cart = await this.getOrCreate(userId);
        const item = await database_1.db.queryOne('SELECT id FROM cart_items WHERE id = ? AND cart_id = ?', [itemId, cart.id]);
        if (!item)
            throw new error_middleware_1.AppError('Cart item not found', 404);
        await database_1.db.query('DELETE FROM cart_items WHERE id = ?', [itemId]);
        return this.getCart(userId);
    }
    async clearCart(userId) {
        const cart = await this.getOrCreate(userId);
        await database_1.db.query('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
    }
    async applyCoupon(userId, code) {
        // Reuses CouponService's validation (min order amount, per-user usage,
        // active window, usage limit) instead of a second, drifting copy of the
        // same rules — a coupon the cart accepts is guaranteed to also be one
        // order creation will accept (see order.service.createFromCart).
        const cart = await this.getCart(userId);
        const { coupon, discount } = await couponService.validate(code, userId, cart.subtotal);
        return { coupon, discount };
    }
    computeSummary(items) {
        const subtotal = items.reduce((sum, item) => {
            const price = item.variant_id ? item.price + (item.price_modifier || 0) : item.price;
            return sum + price * item.quantity;
        }, 0);
        // Pre-checkout estimate: no coupon or shipping method chosen yet, so
        // this mirrors order.service.ts's undiscounted standard-shipping case.
        const shipping = (0, business_rules_1.calculateShippingCost)(subtotal, 'standard', false);
        const tax = (0, business_rules_1.calculateTax)(subtotal);
        const total = subtotal + shipping + tax;
        // Units in the cart, not distinct line items — "3" for one line item
        // with quantity 3, matching what a cart badge/"items in cart" label
        // actually means to a shopper.
        const item_count = items.reduce((sum, item) => sum + item.quantity, 0);
        return { subtotal, shipping, tax, total, item_count };
    }
}
exports.CartService = CartService;
//# sourceMappingURL=cart.service.js.map