"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_service_1 = require("./product.service");
const error_middleware_1 = require("../../middleware/error.middleware");
const activity_logger_1 = require("../../utils/activity-logger");
class ProductController {
    service = new product_service_1.ProductService();
    async getAll(req, res, next) {
        try {
            const { page = 1, limit = 12, category, sort = 'created_at', order = 'DESC', minPrice, maxPrice, search, inStock, featured } = req.query;
            const result = await this.service.getAll({
                page: Number(page),
                limit: Math.min(Number(limit), 50),
                category: category,
                sort: sort,
                order: order,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
                search: search,
                inStock: inStock === 'true',
                featured: featured === 'true',
                userId: req.user?.userId
            });
            res.json({ success: true, ...result });
        }
        catch (err) {
            next(err);
        }
    }
    async getFeatured(req, res, next) {
        try {
            const limit = Math.min(Number(req.query['limit'] || 8), 20);
            const products = await this.service.getFeatured(limit);
            res.json({ success: true, data: products });
        }
        catch (err) {
            next(err);
        }
    }
    async getBySlug(req, res, next) {
        try {
            const product = await this.service.getBySlug(req.params['slug'], req.user?.userId);
            if (!product)
                throw new error_middleware_1.AppError('Product not found', 404);
            res.json({ success: true, data: product });
        }
        catch (err) {
            next(err);
        }
    }
    async search(req, res, next) {
        try {
            const { q, limit = 10 } = req.query;
            if (!q)
                throw new error_middleware_1.AppError('Search query required', 400);
            const results = await this.service.search(q, Number(limit));
            res.json({ success: true, data: results });
        }
        catch (err) {
            next(err);
        }
    }
    async getRelated(req, res, next) {
        try {
            const products = await this.service.getRelated(Number(req.params['id']));
            res.json({ success: true, data: products });
        }
        catch (err) {
            next(err);
        }
    }
    async create(req, res, next) {
        try {
            const files = req.files;
            const product = await this.service.create(req.body, files);
            (0, activity_logger_1.logActivity)({ action: 'product_created', userId: req.user?.userId, module: 'products', referenceType: 'product', referenceId: product?.id, newValues: { name: req.body.name } });
            res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
        }
        catch (err) {
            next(err);
        }
    }
    async update(req, res, next) {
        try {
            const files = req.files;
            const product = await this.service.update(Number(req.params['id']), req.body, files);
            if (!product)
                throw new error_middleware_1.AppError('Product not found', 404);
            (0, activity_logger_1.logActivity)({ action: 'product_updated', userId: req.user?.userId, module: 'products', referenceType: 'product', referenceId: Number(req.params['id']), newValues: { name: req.body.name, status: req.body.status } });
            res.json({ success: true, data: product, message: 'Product updated successfully' });
        }
        catch (err) {
            next(err);
        }
    }
    async updateStatus(req, res, next) {
        try {
            await this.service.updateStatus(Number(req.params['id']), req.body['status']);
            (0, activity_logger_1.logActivity)({ action: 'product_updated', userId: req.user?.userId, module: 'products', referenceType: 'product', referenceId: Number(req.params['id']), newValues: { status: req.body['status'] } });
            res.json({ success: true, message: 'Status updated successfully' });
        }
        catch (err) {
            next(err);
        }
    }
    async delete(req, res, next) {
        try {
            await this.service.delete(Number(req.params['id']));
            (0, activity_logger_1.logActivity)({ action: 'product_deleted', userId: req.user?.userId, module: 'products', referenceType: 'product', referenceId: Number(req.params['id']) });
            res.json({ success: true, message: 'Product deleted successfully' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ProductController = ProductController;
//# sourceMappingURL=product.controller.js.map