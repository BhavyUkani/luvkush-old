"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payment_service_1 = require("./payment.service");
const error_middleware_1 = require("../../middleware/error.middleware");
class PaymentController {
    service = new payment_service_1.PaymentService();
    async createOrder(req, res, next) {
        try {
            const { order_id, is_partial } = req.body;
            if (!order_id)
                throw new error_middleware_1.AppError('order_id is required', 400);
            // The client may only request "partial or full" — the actual amount
            // is always computed server-side from the order's own line items.
            const data = await this.service.createRazorpayOrder(Number(order_id), req.user.userId, !!is_partial);
            res.json({ success: true, data });
        }
        catch (err) {
            next(err);
        }
    }
    async verify(req, res, next) {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;
            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
                throw new error_middleware_1.AppError('Payment verification data incomplete', 400);
            }
            const order = await this.service.verifyAndCapture({
                razorpay_order_id, razorpay_payment_id, razorpay_signature,
                order_id: Number(order_id), user_id: req.user.userId
            });
            res.json({ success: true, data: order, message: 'Payment verified successfully' });
        }
        catch (err) {
            next(err);
        }
    }
    async webhook(req, res, next) {
        try {
            const signature = req.headers['x-razorpay-signature'];
            const rawBody = req.rawBody;
            await this.service.handleWebhook(req.body, signature, rawBody);
            res.json({ success: true });
        }
        catch (err) {
            next(err);
        }
    }
    async refund(req, res, next) {
        try {
            const { order_id, amount } = req.body;
            if (!order_id)
                throw new error_middleware_1.AppError('order_id is required', 400);
            const refund = await this.service.initiateRefund(Number(order_id), amount ? Number(amount) : undefined, req.user?.userId ?? null);
            res.json({ success: true, data: refund, message: 'Refund initiated' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.PaymentController = PaymentController;
//# sourceMappingURL=payment.controller.js.map