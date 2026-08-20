"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hair_solution_admin_controller_1 = require("./hair-solution-admin.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const upload_middleware_1 = require("../../middleware/upload.middleware");
const router = (0, express_1.Router)();
const ctrl = new hair_solution_admin_controller_1.HairSolutionAdminController();
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'));
router.get('/', ctrl.getAll.bind(ctrl));
router.get('/:id', ctrl.getOne.bind(ctrl));
router.post('/', ctrl.create.bind(ctrl));
router.put('/:id', ctrl.update.bind(ctrl));
router.delete('/:id', ctrl.delete.bind(ctrl));
router.post('/:id/upload-image', (0, upload_middleware_1.uploadSingleMiddleware)('image'), ctrl.uploadImage.bind(ctrl));
exports.default = router;
//# sourceMappingURL=hair-solution-admin.routes.js.map