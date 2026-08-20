"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coupon_controller_1 = require("./coupon.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const ctrl = new coupon_controller_1.CouponController();
router.post('/validate', auth_middleware_1.authenticate, ctrl.validate.bind(ctrl));
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.getAll.bind(ctrl));
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.create.bind(ctrl));
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.update.bind(ctrl));
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.delete.bind(ctrl));
exports.default = router;
//# sourceMappingURL=coupon.routes.js.map