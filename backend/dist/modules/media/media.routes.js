"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const media_controller_1 = require("./media.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const upload_middleware_1 = require("../../middleware/upload.middleware");
const router = (0, express_1.Router)();
const ctrl = new media_controller_1.MediaController();
router.post('/upload', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'), (0, upload_middleware_1.uploadMiddleware)('files', 10), ctrl.upload.bind(ctrl));
exports.default = router;
//# sourceMappingURL=media.routes.js.map