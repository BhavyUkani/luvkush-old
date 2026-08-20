"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterController = void 0;
const newsletter_service_1 = require("./newsletter.service");
class NewsletterController {
    service = new newsletter_service_1.NewsletterService();
    async subscribe(req, res, next) {
        try {
            const created = await this.service.subscribe(req.body.email, req.body.name);
            res.status(created ? 201 : 200).json({ success: true, message: 'Successfully subscribed to our newsletter!' });
        }
        catch (err) {
            next(err);
        }
    }
    async unsubscribe(req, res, next) {
        try {
            await this.service.unsubscribe(req.body.email, req.body.token);
            res.json({ success: true, message: 'Successfully unsubscribed.' });
        }
        catch (err) {
            next(err);
        }
    }
    async getAll(req, res, next) {
        try {
            const { page = 1, limit = 50 } = req.query;
            const result = await this.service.getAll(Number(page), Number(limit));
            res.json({ success: true, ...result });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.NewsletterController = NewsletterController;
//# sourceMappingURL=newsletter.controller.js.map