"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blog_controller_1 = require("./blog.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const ctrl = new blog_controller_1.BlogController();
router.get('/', ctrl.getAll.bind(ctrl));
router.get('/:slug', ctrl.getBySlug.bind(ctrl));
// Admin CRUD
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.create.bind(ctrl));
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.update.bind(ctrl));
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.delete.bind(ctrl));
exports.default = router;
//# sourceMappingURL=blog.routes.js.map