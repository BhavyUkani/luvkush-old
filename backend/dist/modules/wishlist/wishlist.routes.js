"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wishlist_controller_1 = require("./wishlist.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const ctrl = new wishlist_controller_1.WishlistController();
router.use(auth_middleware_1.authenticate);
router.get('/', ctrl.getWishlist.bind(ctrl));
router.post('/:productId', ctrl.toggle.bind(ctrl));
router.delete('/:productId', ctrl.remove.bind(ctrl));
router.delete('/', ctrl.clear.bind(ctrl));
exports.default = router;
//# sourceMappingURL=wishlist.routes.js.map