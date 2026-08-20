"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HairSolutionController = void 0;
const hair_solution_service_1 = require("./hair-solution.service");
class HairSolutionController {
    service = new hair_solution_service_1.HairSolutionService();
    async getFeatured(_req, res, next) {
        try {
            const solutions = await this.service.getFeatured();
            res.json({ success: true, data: solutions });
        }
        catch (err) {
            next(err);
        }
    }
    async getWigs(req, res, next) {
        try {
            const wigs = await this.service.getWigs(req.query['gender']);
            res.json({ success: true, data: wigs });
        }
        catch (err) {
            next(err);
        }
    }
    async getPatches(_req, res, next) {
        try {
            const patches = await this.service.getPatches();
            res.json({ success: true, data: patches });
        }
        catch (err) {
            next(err);
        }
    }
    async getBySlug(req, res, next) {
        try {
            const item = await this.service.getBySlug(req.params['slug']);
            if (!item) {
                res.status(404).json({ success: false, message: 'Not found' });
                return;
            }
            res.json({ success: true, data: item });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.HairSolutionController = HairSolutionController;
//# sourceMappingURL=hair-solution.controller.js.map