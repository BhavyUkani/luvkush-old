"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const upload_middleware_1 = require("../../middleware/upload.middleware");
const router = (0, express_1.Router)();
const ctrl = new product_controller_1.ProductController();
// Public routes
router.get('/', auth_middleware_1.optionalAuth, ctrl.getAll.bind(ctrl));
router.get('/featured', ctrl.getFeatured.bind(ctrl));
router.get('/search', ctrl.search.bind(ctrl));
router.get('/:slug', auth_middleware_1.optionalAuth, ctrl.getBySlug.bind(ctrl));
router.get('/:id/related', ctrl.getRelated.bind(ctrl));
// Protected — Admin only
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin', 'super_admin'), (0, upload_middleware_1.uploadMiddleware)('images', 5), ctrl.create.bind(ctrl));
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin', 'super_admin'), (0, upload_middleware_1.uploadMiddleware)('images', 5), ctrl.update.bind(ctrl));
router.patch('/:id/status', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin', 'super_admin'), ctrl.updateStatus.bind(ctrl));
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin', 'super_admin'), ctrl.delete.bind(ctrl));
exports.default = router;
//# sourceMappingURL=product.routes.js.map