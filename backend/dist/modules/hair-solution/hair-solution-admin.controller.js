"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HairSolutionAdminController = void 0;
const hair_solution_admin_service_1 = require("./hair-solution-admin.service");
const error_middleware_1 = require("../../middleware/error.middleware");
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../../utils/config");
const fs_1 = __importDefault(require("fs"));
class HairSolutionAdminController {
    service = new hair_solution_admin_service_1.HairSolutionAdminService();
    async getAll(req, res, next) {
        try {
            const type = req.query['type'];
            const { page = 1, limit = 20, search, status } = req.query;
            const result = await this.service.getAll({
                type,
                page: Number(page),
                limit: Math.min(Number(limit), 100),
                search: search,
                status: status
            });
            res.json({ success: true, ...result });
        }
        catch (err) {
            next(err);
        }
    }
    async getOne(req, res, next) {
        try {
            const item = await this.service.getById(Number(req.params['id']));
            if (!item)
                throw new error_middleware_1.AppError('Not found', 404);
            res.json({ success: true, data: item });
        }
        catch (err) {
            next(err);
        }
    }
    async create(req, res, next) {
        try {
            if (!req.body.name?.trim())
                throw new error_middleware_1.AppError('Name is required', 400);
            if (!req.body.base_price)
                throw new error_middleware_1.AppError('Price is required', 400);
            const item = await this.service.create(req.body);
            res.status(201).json({ success: true, data: item });
        }
        catch (err) {
            next(err);
        }
    }
    async update(req, res, next) {
        try {
            const item = await this.service.update(Number(req.params['id']), req.body);
            res.json({ success: true, data: item });
        }
        catch (err) {
            next(err);
        }
    }
    async delete(req, res, next) {
        try {
            await this.service.delete(Number(req.params['id']));
            res.json({ success: true, message: 'Deleted' });
        }
        catch (err) {
            next(err);
        }
    }
    async uploadImage(req, res, next) {
        try {
            const id = Number(req.params['id']);
            if (!req.file)
                throw new error_middleware_1.AppError('No image uploaded', 400);
            const item = await this.service.getById(id);
            if (!item)
                throw new error_middleware_1.AppError('Not found', 404);
            const dir = path_1.default.join(config_1.config.upload.dir, 'hair-solutions');
            if (!fs_1.default.existsSync(dir))
                fs_1.default.mkdirSync(dir, { recursive: true });
            const filename = `hs-${id}-${Date.now()}.webp`;
            const outputPath = path_1.default.join(dir, filename);
            await (0, sharp_1.default)(req.file.buffer)
                .resize(800, 800, { fit: 'cover', position: 'center' })
                .webp({ quality: 85 })
                .toFile(outputPath);
            const imageUrl = `/uploads/hair-solutions/${filename}`;
            // Update images array and primary_image
            let images = [];
            try {
                images = JSON.parse(item.images || '[]');
            }
            catch {
                images = [];
            }
            images.unshift(imageUrl);
            const primary = images[0];
            await this.service.updateImages(id, primary, JSON.stringify(images));
            res.json({ success: true, data: { image_url: imageUrl, primary_image: primary, images } });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.HairSolutionAdminController = HairSolutionAdminController;
//# sourceMappingURL=hair-solution-admin.controller.js.map