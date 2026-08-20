"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = void 0;
const media_service_1 = require("./media.service");
class MediaController {
    service = new media_service_1.MediaService();
    async upload(req, res, next) {
        try {
            const files = req.files;
            const urls = await this.service.uploadFiles(files, req.body['folder']);
            res.json({ success: true, data: { urls } });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.MediaController = MediaController;
//# sourceMappingURL=media.controller.js.map