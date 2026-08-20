"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogController = void 0;
const blog_service_1 = require("./blog.service");
class BlogController {
    service = new blog_service_1.BlogService();
    async getAll(req, res, next) {
        try {
            const { page = 1, limit = 9, tag } = req.query;
            const result = await this.service.getAll(Number(page), Number(limit), tag);
            res.json({ success: true, ...result });
        }
        catch (err) {
            next(err);
        }
    }
    async getBySlug(req, res, next) {
        try {
            const post = await this.service.getBySlug(req.params['slug']);
            res.json({ success: true, data: post });
        }
        catch (err) {
            next(err);
        }
    }
    async create(req, res, next) {
        try {
            const data = await this.service.create(req.body, req.user.userId);
            res.status(201).json({ success: true, data });
        }
        catch (err) {
            next(err);
        }
    }
    async update(req, res, next) {
        try {
            await this.service.update(Number(req.params['id']), req.body);
            res.json({ success: true, message: 'Post updated' });
        }
        catch (err) {
            next(err);
        }
    }
    async delete(req, res, next) {
        try {
            await this.service.delete(Number(req.params['id']));
            res.json({ success: true, message: 'Post deleted' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.BlogController = BlogController;
//# sourceMappingURL=blog.controller.js.map