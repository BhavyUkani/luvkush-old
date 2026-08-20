"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
const config_1 = require("../../utils/config");
const error_middleware_1 = require("../../middleware/error.middleware");
class MediaService {
    /** Sanitizes the requested folder and resolves it against the upload root,
     * rejecting anything that would escape it (no `..`, no slashes, no
     * absolute paths). */
    resolveUploadDir(requestedFolder) {
        const folder = path_1.default.basename(requestedFolder || 'general').replace(/[^a-zA-Z0-9_-]/g, '') || 'general';
        const uploadRoot = path_1.default.resolve(config_1.config.upload.dir);
        const uploadDir = path_1.default.resolve(uploadRoot, folder);
        if (uploadDir !== uploadRoot && !uploadDir.startsWith(uploadRoot + path_1.default.sep)) {
            throw new error_middleware_1.AppError('Invalid folder', 400);
        }
        return { folder, uploadDir };
    }
    async uploadFiles(files, requestedFolder) {
        if (!files?.length)
            throw new error_middleware_1.AppError('No files uploaded', 400);
        const { folder, uploadDir } = this.resolveUploadDir(requestedFolder);
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        const uploaded = [];
        for (const file of files) {
            const filename = `${(0, uuid_1.v4)()}.webp`;
            const outputPath = path_1.default.join(uploadDir, filename);
            await (0, sharp_1.default)(file.buffer)
                .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 85 })
                .toFile(outputPath);
            uploaded.push(`/uploads/${folder}/${filename}`);
        }
        return uploaded;
    }
}
exports.MediaService = MediaService;
//# sourceMappingURL=media.service.js.map