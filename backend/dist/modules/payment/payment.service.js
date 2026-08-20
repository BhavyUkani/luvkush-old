"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
exports.timingSafeEqualStrings = timingSafeEqualStrings;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../../utils/database");
const error_middleware_1 = require("../../middleware/error.middleware");
const config_1 = require("../../utils/config");
const logger_1 = require("../../utils/logger");
const activity_logger_1 = require("../../utils/activity-logger");
const order_service_1 = require("../order/order.service");
const orderService = new order_service_1.OrderService();
function timingSafeEqualStrings(a, b) {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length)
        return false;
    return crypto_1.default.timingSafeEqual(bufA, bufB);
}
class PaymentService {
    _razorpay = null;
    get razorpay() {
        if (!this._razorpay) {
            if (!config_1.config.razorpay.keyId || !config_1.config.razorpay.keySecret) {
                throw new error_middleware_1.AppError('Payment gateway not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.', 503);
            }
            this._razorpay = new razorpay_1.default({
                key_id: config_1.config.razorpay.keyId,
                key_secret: config_1.config.razorpay.keySecret,
            });
        }
        return this._razorpay;
    }
    /**
     * The amount actually owed for a (possibly partial) payment, computed
     * entirely from server-held data (order_items + the product's configured
     * payment_mode/advance_amount). The client only ever gets to say whether
     * it wants a partial charge, never how much that charge should be.
     */
    async computeRequiredAdvance(orderId) {
        const rows = await database_1.db.query(`
      SELECT oi.quantity, oi.total_amount, p.payment_mode, p.advance_amount
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);
        let required = 0;
        for (const item of rows) {
            if (item.payment_mode === 'full_online') {
                required += Number(item.total_amount);
            }
            else if (item.payment_mode === 'partial' && item.advance_amount) {
                required += Number(item.advance_amount) * item.quantity;
            }
        }
        const order = await database_1.db.queryOne('SELECT total_amount FROM orders WHERE id = ?', [orderId]);
        return Math.min(required, Number(order?.total_amount || 0));
    }
    async createRazorpayOrder(orderId, userId, isPartial) {
        const order = await orderService.getById(orderId, userId);
        if (!order)
            throw new error_middleware_1.AppError('Order not found', 404);
        if (order.payment_status === 'paid')
            throw new error_middleware_1.AppError('Order already paid', 400);
        let chargeAmount = Number(order.total_amount);
        if (isPartial) {
            chargeAmount = await this.computeRequiredAdvance(orderId);
            if (chargeAmount <= 0)
                throw new error_middleware_1.AppError('This order does not support a partial payment', 400);
        }
        const amountInPaise = Math.round(chargeAmount * 100);
        const rzpOrder = await this.razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: order.order_number,
            notes: {
                order_id: String(orderId),
                user_id: String(userId),
            }
        });
        // Persist both the gateway order id (to bind the eventual payment
        // signature to *this* order — see verifyAndCapture) and the exact
        // amount we told Razorpay to charge, so verification never has to
        // trust anything the client says about how much was paid.
        await database_1.db.query('UPDATE orders SET razorpay_order_id = ?, pending_charge_amount = ?, updated_at = NOW() WHERE id = ?', [rzpOrder.id, chargeAmount, orderId]);
        return {
            razorpay_order_id: rzpOrder.id,
            amount: amountInPaise,
            currency: 'INR',
            order_number: order.order_number,
            key_id: config_1.config.razorpay.keyId,
        };
    }
    async verifyAndCapture(data) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id, user_id } = data;
        const order = await database_1.db.queryOne('SELECT id, razorpay_order_id, payment_status, total_amount, pending_charge_amount FROM orders WHERE id = ? AND user_id = ?', [order_id, user_id]);
        if (!order)
            throw new error_middleware_1.AppError('Order not found', 404);
        // Idempotency guard — a retried /verify call (or a race with the
        // webhook) must not re-run the capture side effects a second time.
        if (order.payment_status === 'paid') {
            return orderService.getById(order_id, user_id);
        }
        // Bind the signature to *this* order's own Razorpay order id. Without
        // this check, a valid signature captured for a cheap order could be
        // replayed against any other unpaid order_id belonging to the same user.
        if (!order.razorpay_order_id || order.razorpay_order_id !== razorpay_order_id) {
            throw new error_middleware_1.AppError('Payment does not match this order', 400);
        }
        const expectedSig = crypto_1.default
            .createHmac('sha256', config_1.config.razorpay.keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');
        if (!timingSafeEqualStrings(expectedSig, razorpay_signature)) {
            throw new error_middleware_1.AppError('Payment verification failed', 400);
        }
        const chargeAmount = order.pending_charge_amount != null
            ? Number(order.pending_charge_amount)
            : Number(order.total_amount);
        const isPartial = chargeAmount < Number(order.total_amount);
        await database_1.db.transaction(async (conn) => {
            await conn.execute(`
        UPDATE orders SET
          payment_status = 'paid',
          razorpay_payment_id = ?,
          razorpay_signature = ?,
          status = 'confirmed',
          advance_paid_amount = ?,
          pending_charge_amount = NULL,
          paid_at = NOW(),
          updated_at = NOW()
        WHERE id = ? AND user_id = ?
      `, [razorpay_payment_id, razorpay_signature, isPartial ? chargeAmount : null, order_id, user_id]);
            await conn.execute(`
        INSERT INTO payment_transactions (order_id, gateway, gateway_order_id, gateway_payment_id, amount, status, created_at)
        VALUES (?, 'razorpay', ?, ?, ?, 'success', NOW())
      `, [order_id, razorpay_order_id, razorpay_payment_id, chargeAmount]);
            await conn.execute('DELETE ci FROM cart_items ci JOIN carts c ON ci.cart_id = c.id WHERE c.user_id = ?', [user_id]);
        });
        return orderService.getById(order_id, user_id);
    }
    async handleWebhook(payload, signature, rawBody) {
        const webhookSecret = config_1.config.razorpay.webhookSecret;
        if (!webhookSecret) {
            // Silently no-op'ing here (the old behaviour) means the webhook
            // endpoint is unauthenticated by default — reject loudly instead so
            // misconfiguration is visible in logs rather than a fund-safety hole.
            logger_1.logger.error('Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not configured.');
            throw new error_middleware_1.AppError('Webhook not configured', 503);
        }
        if (!signature || !rawBody) {
            throw new error_middleware_1.AppError('Invalid webhook request', 400);
        }
        const expectedSig = crypto_1.default
            .createHmac('sha256', webhookSecret)
            .update(rawBody)
            .digest('hex');
        if (!timingSafeEqualStrings(expectedSig, signature)) {
            throw new error_middleware_1.AppError('Invalid webhook signature', 400);
        }
        const event = payload.event;
        const paymentEntity = payload.payload?.payment?.entity;
        if (event === 'payment.captured' && paymentEntity) {
            const rzpOrderId = paymentEntity.order_id;
            const order = await database_1.db.queryOne('SELECT id, user_id, payment_status, pending_charge_amount, total_amount FROM orders WHERE razorpay_order_id = ?', [rzpOrderId]);
            if (order && order.payment_status !== 'paid') {
                const chargeAmount = order.pending_charge_amount != null
                    ? Number(order.pending_charge_amount)
                    : Number(order.total_amount);
                const isPartial = chargeAmount < Number(order.total_amount);
                await database_1.db.transaction(async (conn) => {
                    await conn.execute(`
            UPDATE orders SET payment_status = 'paid', status = 'confirmed',
              razorpay_payment_id = ?, advance_paid_amount = ?, pending_charge_amount = NULL,
              paid_at = NOW(), updated_at = NOW()
            WHERE id = ?
          `, [paymentEntity.id, isPartial ? chargeAmount : null, order.id]);
                    await conn.execute(`
            INSERT INTO payment_transactions (order_id, gateway, gateway_order_id, gateway_payment_id, amount, status, created_at)
            VALUES (?, 'razorpay', ?, ?, ?, 'success', NOW())
          `, [order.id, rzpOrderId, paymentEntity.id, chargeAmount]);
                    await conn.execute('DELETE ci FROM cart_items ci JOIN carts c ON ci.cart_id = c.id WHERE c.user_id = ?', [order.user_id]);
                });
            }
        }
        if (event === 'payment.failed' && paymentEntity) {
            const rzpOrderId = paymentEntity.order_id;
            await database_1.db.query('UPDATE orders SET payment_status = "failed", updated_at = NOW() WHERE razorpay_order_id = ?', [rzpOrderId]);
        }
    }
    async initiateRefund(orderId, amount, adminUserId) {
        const order = await database_1.db.queryOne('SELECT razorpay_payment_id, total_amount, payment_status FROM orders WHERE id = ?', [orderId]);
        if (!order?.razorpay_payment_id)
            throw new error_middleware_1.AppError('No payment found for this order', 400);
        const ledger = await database_1.db.queryOne(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END), 0) as paid,
        COALESCE(SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END), 0) as refunded
      FROM payment_transactions WHERE order_id = ?
    `, [orderId]);
        const paid = Number(ledger?.paid || 0);
        const alreadyRefunded = Number(ledger?.refunded || 0);
        const refundable = Math.round((paid - alreadyRefunded) * 100) / 100;
        if (refundable <= 0)
            throw new error_middleware_1.AppError('This order has already been fully refunded', 400);
        const requested = amount != null ? Number(amount) : refundable;
        if (!Number.isFinite(requested) || requested <= 0) {
            throw new error_middleware_1.AppError('Refund amount must be a positive number', 400);
        }
        if (requested > refundable + 0.01) {
            throw new error_middleware_1.AppError(`Refund amount cannot exceed the refundable balance of ₹${refundable.toFixed(2)}`, 400);
        }
        const refundAmountPaise = Math.round(requested * 100);
        const refund = await this.razorpay.payments.refund(order.razorpay_payment_id, {
            amount: refundAmountPaise,
            speed: 'normal',
            notes: { order_id: String(orderId) }
        });
        const isFullyRefunded = requested >= refundable - 0.01;
        await database_1.db.transaction(async (conn) => {
            // Only flip payment_status once nothing refundable remains — a partial
            // refund is fully described by the payment_transactions ledger, and
            // introducing a third payment_status value here would be silently
            // unrecognised by the admin UI's fixed status badges.
            if (isFullyRefunded) {
                await conn.execute("UPDATE orders SET payment_status = 'refunded', status = 'refunded', updated_at = NOW() WHERE id = ?", [orderId]);
            }
            await conn.execute(`
        INSERT INTO payment_transactions (order_id, gateway, gateway_payment_id, amount, status, created_at)
        VALUES (?, 'razorpay', ?, ?, 'refunded', NOW())
      `, [orderId, order.razorpay_payment_id, requested]);
        });
        (0, activity_logger_1.logActivity)({
            action: 'order_status_changed',
            userId: adminUserId,
            module: 'payments',
            referenceType: 'order',
            referenceId: orderId,
            newValues: { refund_amount: requested, fully_refunded: isFullyRefunded }
        });
        return refund;
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map