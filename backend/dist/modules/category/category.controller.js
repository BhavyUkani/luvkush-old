"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const category_service_1 = require("./category.service");
const error_middleware_1 = require("../../middleware/error.middleware");
const activity_logger_1 = require("../../utils/activity-logger");
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../../utils/config");
const fs_1 = __importDefault(require("fs"));
class CategoryController {
    service = new category_service_1.CategoryService();
    async getAll(req, res, next) {
        try {
            const includeInactive = req.user?.role === 'super_admin' || req.user?.role === 'admin';
            const categories = await this.service.getAll(includeInactive);
            res.json({ success: true, data: categories });
        }
        catch (err) {
            next(err);
        }
    }
    async getBySlug(req, res, next) {
        try {
            const category = await this.service.getBySlug(req.params['slug']);
            if (!category)
                throw new error_middleware_1.AppError('Category not found', 404);
            res.json({ success: true, data: category });
        }
        catch (err) {
            next(err);
        }
    }
    async create(req, res, next) {
        try {
            const { name } = req.body;
            if (!name?.trim())
                throw new error_middleware_1.AppError('Category name is required', 400);
            const category = await this.service.create(req.body);
            (0, activity_logger_1.logActivity)({ action: 'category_created', userId: req.user?.userId, module: 'categories', referenceType: 'category', referenceId: category?.id, newValues: { name } });
            res.status(201).json({ success: true, data: category, message: 'Category created' });
        }
        catch (err) {
            next(err);
        }
    }
    async update(req, res, next) {
        try {
            const id = Number(req.params['id']);
            if (!req.body.name?.trim())
                throw new error_middleware_1.AppError('Category name is required', 400);
            const category = await this.service.update(id, req.body);
            (0, activity_logger_1.logActivity)({ action: 'category_updated', userId: req.user?.userId, module: 'categories', referenceType: 'category', referenceId: id, newValues: { name: req.body.name } });
            res.json({ success: true, data: category, message: 'Category updated' });
        }
        catch (err) {
            next(err);
        }
    }
    async delete(req, res, next) {
        try {
            await this.service.delete(Number(req.params['id']));
            (0, activity_logger_1.logActivity)({ action: 'category_deleted', userId: req.user?.userId, module: 'categories', referenceType: 'category', referenceId: Number(req.params['id']) });
            res.json({ success: true, message: 'Category deactivated' });
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
            const dir = path_1.default.join(config_1.config.upload.dir, 'categories');
            if (!fs_1.default.existsSync(dir))
                fs_1.default.mkdirSync(dir, { recursive: true });
            const filename = `cat-${id}-${Date.now()}.webp`;
            const outputPath = path_1.default.join(dir, filename);
            await (0, sharp_1.default)(req.file.buffer)
                .resize(600, 600, { fit: 'cover', position: 'center' })
                .webp({ quality: 85 })
                .toFile(outputPath);
            const imageUrl = `/uploads/categories/${filename}`;
            const category = await this.service.update(id, { image_url: imageUrl });
            res.json({ success: true, data: category, image_url: imageUrl });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.CategoryController = CategoryController;
//# sourceMappingURL=category.controller.js.map