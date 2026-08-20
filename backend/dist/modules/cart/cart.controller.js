"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const cart_service_1 = require("./cart.service");
const error_middleware_1 = require("../../middleware/error.middleware");
class CartController {
    service = new cart_service_1.CartService();
    async getCart(req, res, next) {
        try {
            const cart = await this.service.getCart(req.user.userId);
            res.json({ success: true, data: cart });
        }
        catch (err) {
            next(err);
        }
    }
    async addItem(req, res, next) {
        try {
            const { product_id, quantity = 1, variant_id } = req.body;
            if (!product_id)
                throw new error_middleware_1.AppError('product_id is required', 400);
            const cart = await this.service.addItem(req.user.userId, Number(product_id), Number(quantity), variant_id ? Number(variant_id) : undefined);
            res.json({ success: true, data: cart, message: 'Item added to cart' });
        }
        catch (err) {
            next(err);
        }
    }
    async updateItem(req, res, next) {
        try {
            const { quantity } = req.body;
            if (quantity === undefined)
                throw new error_middleware_1.AppError('quantity is required', 400);
            const cart = await this.service.updateItem(req.user.userId, Number(req.params['itemId']), Number(quantity));
            res.json({ success: true, data: cart });
        }
        catch (err) {
            next(err);
        }
    }
    async removeItem(req, res, next) {
        try {
            const cart = await this.service.removeItem(req.user.userId, Number(req.params['itemId']));
            res.json({ success: true, data: cart, message: 'Item removed' });
        }
        catch (err) {
            next(err);
        }
    }
    async clearCart(req, res, next) {
        try {
            await this.service.clearCart(req.user.userId);
            res.json({ success: true, message: 'Cart cleared' });
        }
        catch (err) {
            next(err);
        }
    }
    async applyCoupon(req, res, next) {
        try {
            const { code } = req.body;
            if (!code?.trim())
                throw new error_middleware_1.AppError('Coupon code is required', 400);
            const result = await this.service.applyCoupon(req.user.userId, code.trim().toUpperCase());
            res.json({ success: true, data: result, message: 'Coupon applied' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.CartController = CartController;
//# sourceMappingURL=cart.controller.js.map