"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponController = void 0;
const coupon_service_1 = require("./coupon.service");
const error_middleware_1 = require("../../middleware/error.middleware");
class CouponController {
    service = new coupon_service_1.CouponService();
    async validate(req, res, next) {
        try {
            const { code, subtotal } = req.body;
            if (!code || subtotal === undefined)
                throw new error_middleware_1.AppError('code and subtotal are required', 400);
            const result = await this.service.validate(code.toUpperCase(), req.user.userId, Number(subtotal));
            res.json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    }
    async getAll(req, res, next) {
        try {
            const { page = 1, limit = 20 } = req.query;
            const result = await this.service.getAll(Number(page), Number(limit));
            res.json({ success: true, ...result });
        }
        catch (err) {
            next(err);
        }
    }
    async create(req, res, next) {
        try {
            const coupon = await this.service.create(req.body);
            res.status(201).json({ success: true, data: coupon, message: 'Coupon created' });
        }
        catch (err) {
            next(err);
        }
    }
    async update(req, res, next) {
        try {
            const coupon = await this.service.update(Number(req.params['id']), req.body);
            res.json({ success: true, data: coupon, message: 'Coupon updated' });
        }
        catch (err) {
            next(err);
        }
    }
    async delete(req, res, next) {
        try {
            await this.service.delete(Number(req.params['id']));
            res.json({ success: true, message: 'Coupon deleted' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.CouponController = CouponController;
//# sourceMappingURL=coupon.controller.js.map