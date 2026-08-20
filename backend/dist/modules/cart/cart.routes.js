"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = require("./cart.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const ctrl = new cart_controller_1.CartController();
router.use(auth_middleware_1.authenticate);
router.get('/', ctrl.getCart.bind(ctrl));
router.post('/items', ctrl.addItem.bind(ctrl));
router.put('/items/:itemId', ctrl.updateItem.bind(ctrl));
router.delete('/items/:itemId', ctrl.removeItem.bind(ctrl));
router.delete('/', ctrl.clearCart.bind(ctrl));
router.post('/coupon', ctrl.applyCoupon.bind(ctrl));
exports.default = router;
//# sourceMappingURL=cart.routes.js.map