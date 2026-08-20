"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactController = void 0;
const contact_service_1 = require("./contact.service");
class ContactController {
    service = new contact_service_1.ContactService();
    async create(req, res, next) {
        try {
            await this.service.create(req.body, req.ip || null, (req.headers['user-agent'] || ''));
            res.status(201).json({ success: true, message: 'Your message has been received. We will get back to you within 24 hours.' });
        }
        catch (err) {
            next(err);
        }
    }
    async getAll(req, res, next) {
        try {
            const { page = 1, limit = 20, status } = req.query;
            const result = await this.service.getAll(Number(page), Number(limit), status);
            res.json({ success: true, ...result });
        }
        catch (err) {
            next(err);
        }
    }
    async updateStatus(req, res, next) {
        try {
            await this.service.updateStatus(Number(req.params['id']), req.body['status']);
            res.json({ success: true, message: 'Status updated' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ContactController = ContactController;
//# sourceMappingURL=contact.controller.js.map