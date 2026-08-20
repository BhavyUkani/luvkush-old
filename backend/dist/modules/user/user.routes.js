"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const ctrl = new user_controller_1.UserController();
router.use(auth_middleware_1.authenticate);
router.get('/profile', ctrl.getProfile.bind(ctrl));
router.put('/profile', ctrl.updateProfile.bind(ctrl));
router.post('/change-password', ctrl.changePassword.bind(ctrl));
router.get('/addresses', ctrl.getAddresses.bind(ctrl));
router.post('/addresses', ctrl.addAddress.bind(ctrl));
router.put('/addresses/:id', ctrl.updateAddress.bind(ctrl));
router.put('/addresses/:id/default', ctrl.setDefaultAddress.bind(ctrl));
router.delete('/addresses/:id', ctrl.deleteAddress.bind(ctrl));
exports.default = router;
//# sourceMappingURL=user.routes.js.map