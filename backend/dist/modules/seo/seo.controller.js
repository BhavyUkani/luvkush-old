"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoController = void 0;
const seo_service_1 = require("./seo.service");
class SeoController {
    service = new seo_service_1.SeoService();
    async getMeta(req, res, next) {
        try {
            const { path: urlPath } = req.query;
            if (!urlPath) {
                res.json({ success: true, data: null });
                return;
            }
            const meta = await this.service.getMetaForPath(String(urlPath));
            res.json({ success: true, data: meta });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.SeoController = SeoController;
//# sourceMappingURL=seo.controller.js.map