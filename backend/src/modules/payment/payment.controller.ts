import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service';
import { AppError } from '../../middleware/error.middleware';

export class PaymentController {
  private service = new PaymentService();

  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { order_id, is_partial } = req.body;
      if (!order_id) throw new AppError('order_id is required', 400);
      // The client may only request "partial or full" — the actual amount
      // is always computed server-side from the order's own line items.
      const data = await this.service.createRazorpayOrder(
        Number(order_id), req.user!.userId, !!is_partial
      );
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
        throw new AppError('Payment verification data incomplete', 400);
      }
      const order = await this.service.verifyAndCapture({
        razorpay_order_id, razorpay_payment_id, razorpay_signature,
        order_id: Number(order_id), user_id: req.user!.userId
      });
      res.json({ success: true, data: order, message: 'Payment verified successfully' });
    } catch (err) { next(err); }
  }

  async webhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['x-razorpay-signature'] as string | undefined;
      const rawBody = (req as any).rawBody as Buffer | undefined;
      await this.service.handleWebhook(req.body, signature, rawBody);
      res.json({ success: true });
    } catch (err) { next(err); }
  }

  async refund(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { order_id, amount } = req.body;
      if (!order_id) throw new AppError('order_id is required', 400);
      const refund = await this.service.initiateRefund(Number(order_id), amount ? Number(amount) : undefined, req.user?.userId ?? null);
      res.json({ success: true, data: refund, message: 'Refund initiated' });
    } catch (err) { next(err); }
  }
}
