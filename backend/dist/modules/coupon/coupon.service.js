"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponService = void 0;
const database_1 = require("../../utils/database");
const error_middleware_1 = require("../../middleware/error.middleware");
class CouponService {
    async validate(code, userId, subtotal) {
        const coupon = await database_1.db.queryOne(`
      SELECT * FROM coupons
      WHERE code = ? AND is_active = 1
        AND (valid_from IS NULL OR valid_from <= NOW())
        AND (valid_until IS NULL OR valid_until >= NOW())
        AND (usage_limit IS NULL OR usage_count < usage_limit)
    `, [code]);
        if (!coupon)
            throw new error_middleware_1.AppError('Invalid or expired coupon code', 400);
        if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
            throw new error_middleware_1.AppError(`Minimum order of ₹${coupon.min_order_amount} required for this coupon`, 400);
        }
        const userUsage = await database_1.db.queryOne('SELECT COUNT(*) as cnt FROM orders WHERE user_id = ? AND coupon_code = ? AND status != "cancelled"', [userId, code]);
        if (coupon.usage_per_user && userUsage?.cnt >= coupon.usage_per_user) {
            throw new error_middleware_1.AppError('You have already used this coupon', 400);
        }
        const discount = this.calculateDiscount(coupon, subtotal);
        return { coupon, discount };
    }
    async getAll(page = 1, limit = 20) {
        const sql = 'SELECT * FROM coupons ORDER BY created_at DESC';
        return database_1.db.paginate(sql, [], page, limit);
    }
    async getById(id) {
        return database_1.db.queryOne('SELECT * FROM coupons WHERE id = ?', [id]);
    }
    async create(data) {
        if (!data.code?.trim())
            throw new error_middleware_1.AppError('Coupon code is required', 400);
        if (!data.discount_type || !['percentage', 'fixed', 'free_shipping'].includes(data.discount_type)) {
            throw new error_middleware_1.AppError('Invalid discount type', 400);
        }
        this.validateDiscountValue(data);
        const code = data.code.trim().toUpperCase();
        const existing = await database_1.db.queryOne('SELECT id FROM coupons WHERE code = ?', [code]);
        if (existing)
            throw new error_middleware_1.AppError('Coupon code already exists', 400);
        const result = await database_1.db.query(`
      INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, usage_per_user, valid_from, valid_until, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            code, data.description || null, data.discount_type, data.discount_value,
            data.min_order_amount || null, data.max_discount_amount || null,
            data.usage_limit || null, data.usage_per_user || 1,
            data.valid_from || null, data.valid_until || null, 1
        ]);
        return this.getById(result.insertId);
    }
    async update(id, data) {
        const coupon = await this.getById(id);
        if (!coupon)
            throw new error_middleware_1.AppError('Coupon not found', 404);
        this.validateDiscountValue(data);
        await database_1.db.query(`
      UPDATE coupons SET
        description = ?, discount_type = ?, discount_value = ?,
        min_order_amount = ?, max_discount_amount = ?, usage_limit = ?,
        usage_per_user = ?, valid_from = ?, valid_until = ?, is_active = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
            data.description || null, data.discount_type, data.discount_value,
            data.min_order_amount || null, data.max_discount_amount || null,
            data.usage_limit || null, data.usage_per_user || 1,
            data.valid_from || null, data.valid_until || null,
            data.is_active !== undefined ? data.is_active : 1, id
        ]);
        return this.getById(id);
    }
    async delete(id) {
        await database_1.db.query('DELETE FROM coupons WHERE id = ?', [id]);
    }
    validateDiscountValue(data) {
        const value = Number(data.discount_value);
        if (!Number.isFinite(value) || value < 0)
            throw new error_middleware_1.AppError('discount_value must be a non-negative number', 400);
        if (data.discount_type === 'percentage' && value > 100) {
            throw new error_middleware_1.AppError('A percentage discount cannot exceed 100', 400);
        }
    }
    calculateDiscount(coupon, subtotal) {
        if (coupon.discount_type === 'free_shipping')
            return 0;
        if (coupon.discount_type === 'fixed') {
            return Math.min(coupon.discount_value, subtotal);
        }
        // percentage — always capped at the subtotal itself (a coupon can never
        // discount more than the order is worth), and additionally at
        // max_discount_amount when the admin set one.
        const discount = Math.floor(subtotal * coupon.discount_value / 100);
        const capped = coupon.max_discount_amount
            ? Math.min(discount, coupon.max_discount_amount)
            : discount;
        return Math.min(capped, subtotal);
    }
}
exports.CouponService = CouponService;
//# sourceMappingURL=coupon.service.js.map