"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistController = void 0;
const wishlist_service_1 = require("./wishlist.service");
const error_middleware_1 = require("../../middleware/error.middleware");
class WishlistController {
    service = new wishlist_service_1.WishlistService();
    async getWishlist(req, res, next) {
        try {
            const items = await this.service.getWishlist(req.user.userId);
            res.json({ success: true, data: items });
        }
        catch (err) {
            next(err);
        }
    }
    async toggle(req, res, next) {
        try {
            const productId = Number(req.params['productId']);
            if (!productId)
                throw new error_middleware_1.AppError('Product ID required', 400);
            const result = await this.service.toggle(req.user.userId, productId);
            res.json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    }
    async remove(req, res, next) {
        try {
            await this.service.remove(req.user.userId, Number(req.params['productId']));
            res.json({ success: true, message: 'Removed from wishlist' });
        }
        catch (err) {
            next(err);
        }
    }
    async clear(req, res, next) {
        try {
            await this.service.clear(req.user.userId);
            res.json({ success: true, message: 'Wishlist cleared' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.WishlistController = WishlistController;
//# sourceMappingURL=wishlist.controller.js.map