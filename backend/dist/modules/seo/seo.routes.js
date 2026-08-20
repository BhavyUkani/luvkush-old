"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const seo_controller_1 = require("./seo.controller");
const router = (0, express_1.Router)();
const ctrl = new seo_controller_1.SeoController();
// Returns SEO metadata for a given path (used by SSR)
router.get('/meta', ctrl.getMeta.bind(ctrl));
exports.default = router;
//# sourceMappingURL=seo.routes.js.map