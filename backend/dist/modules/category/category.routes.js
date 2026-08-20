"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("./category.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const upload_middleware_1 = require("../../middleware/upload.middleware");
const router = (0, express_1.Router)();
const ctrl = new category_controller_1.CategoryController();
router.get('/', auth_middleware_1.optionalAuth, ctrl.getAll.bind(ctrl));
router.get('/:slug', ctrl.getBySlug.bind(ctrl));
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.create.bind(ctrl));
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.update.bind(ctrl));
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), ctrl.delete.bind(ctrl));
router.post('/:id/upload-image', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), (0, upload_middleware_1.uploadSingleMiddleware)('image'), ctrl.uploadImage.bind(ctrl));
exports.default = router;
//# sourceMappingURL=category.routes.js.map