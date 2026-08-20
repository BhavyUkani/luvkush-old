"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hair_solution_controller_1 = require("./hair-solution.controller");
const router = (0, express_1.Router)();
const ctrl = new hair_solution_controller_1.HairSolutionController();
router.get('/', ctrl.getFeatured.bind(ctrl));
router.get('/wigs', ctrl.getWigs.bind(ctrl));
router.get('/patches', ctrl.getPatches.bind(ctrl));
router.get('/:slug', ctrl.getBySlug.bind(ctrl));
exports.default = router;
//# sourceMappingURL=hair-solution.routes.js.map