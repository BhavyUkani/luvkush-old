import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { AppError } from '../middleware/error.middleware';
import { logActivity } from '../utils/activity-logger';

export class OrderController {
  private service = new OrderService();

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { address_id, address, shipping_address: rawShipping, coupon_code, notes, payment_method } = req.body;
      if (!payment_method) throw new AppError('Payment method is required', 400);

      let shippingAddr = rawShipping || address;

      if (address_id) {
        const { db } = await import('../utils/database');
        const saved = await db.queryOne<any>(
          'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
          [address_id, req.user!.userId]
        );
        if (!saved) throw new AppError('Address not found', 404);
        shippingAddr = {
          full_name: saved.recipient_name,
          phone: saved.phone,
          address_line1: saved.address_line1,
          address_line2: saved.address_line2,
          city: saved.city,
          state: saved.state,
          pincode: saved.pincode,
          country: saved.country
        };
      }

      if (!shippingAddr) throw new AppError('Shipping address is required', 400);

      const order = await this.service.createFromCart(req.user!.userId, {
        shipping_address: shippingAddr, coupon_code, notes, payment_method
      });
      res.status(201).json({ success: true, data: order, message: 'Order placed successfully' });
    } catch (err) { next(err); }
  }

  async getMyOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await this.service.getUserOrders(req.user!.userId, Number(page), Number(limit));
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }

  async getMyOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await this.service.getById(Number(req.params['id']), req.user!.userId);
      if (!order) throw new AppError('Order not found', 404);
      res.json({ success: true, data: order });
    } catch (err) { next(err); }
  }

  async getMyOrderStatusHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = Number(req.params['id']);
      const order = await this.service.getById(orderId, req.user!.userId);
      if (!order) throw new AppError('Order not found', 404);

      const history = await this.service.getStatusHistory(orderId);
      res.json({ success: true, data: history });
    } catch (err) { next(err); }
  }

  async getByOrderNumber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await this.service.getByOrderNumber(req.params['orderNumber'], req.user?.userId);
      if (!order) throw new AppError('Order not found', 404);
      res.json({ success: true, data: order });
    } catch (err) { next(err); }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reason = 'Customer request' } = req.body;
      await this.service.cancelOrder(Number(req.params['id']), req.user!.userId, reason);
      res.json({ success: true, message: 'Order cancelled' });
    } catch (err) { next(err); }
  }

  async abortPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.service.abortOnlineOrder(Number(req.params['id']), req.user!.userId);
      res.json({ success: true, message: 'Payment aborted. Your cart is intact.' });
    } catch (err) { next(err); }
  }

  // Admin endpoints
  async adminGetAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, status, payment_status, search } = req.query;
      const result = await this.service.adminGetAll(Number(page), Number(limit), {
        status: status as string,
        payment_status: payment_status as string,
        search: search as string
      });
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }

  async adminGetOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await this.service.getById(Number(req.params['id']));
      if (!order) throw new AppError('Order not found', 404);
      res.json({ success: true, data: order });
    } catch (err) { next(err); }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, note, date } = req.body;
      if (!status) throw new AppError('Status is required', 400);
      const orderId = Number(req.params['id']);
      await this.service.updateStatus(orderId, status, note, date, req.user?.userId ?? null);
      logActivity({ action: 'order_status_changed', userId: req.user?.userId, module: 'orders', referenceType: 'order', referenceId: orderId, newValues: { status, note } });
      res.json({ success: true, message: 'Order status updated' });
    } catch (err) { next(err); }
  }

  async getStatusHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = Number(req.params['id']);
      const history = await this.service.getStatusHistory(orderId);
      res.json({ success: true, data: history });
    } catch (err) { next(err); }
  }

  async updateTracking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tracking_number, courier_name, tracking_url } = req.body;
      if (!tracking_number) throw new AppError('Tracking number is required', 400);
      await this.service.updateTracking(Number(req.params['id']), { tracking_number, courier_name, tracking_url });
      res.json({ success: true, message: 'Tracking updated' });
    } catch (err) { next(err); }
  }

  async getCourierRates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = Number(req.params['id']);
      const order = await this.service.getById(orderId);
      if (!order) throw new AppError('Order not found', 404);

      let addr: any = {};
      try {
        addr = typeof order.shipping_address === 'string'
          ? JSON.parse(order.shipping_address)
          : order.shipping_address;
      } catch (err) {
        throw new AppError('Failed to parse order shipping address', 500);
      }

      // Allow query parameter overrides
      const queryPincode = req.query['pincode'];
      const pincode = (queryPincode || addr?.pincode)?.toString().trim();
      if (!pincode) {
        throw new AppError('No pincode found in shipping address', 400);
      }

      const queryWeight = req.query['weight']; // in grams
      const totalWeight = queryWeight ? Number(queryWeight) / 1000 : 0.5; // convert grams to kg, default 0.5kg

      const queryCod = req.query['cod'];
      const cod = queryCod !== undefined ? (queryCod === 'true' || queryCod === '1') : order.payment_method === 'cod';

      const queryDeclaredValue = req.query['declared_value'];
      const declaredValue = queryDeclaredValue !== undefined ? Number(queryDeclaredValue) : (Number(order.total_amount) || 0);

      const queryLength = req.query['length'];
      const queryWidth = req.query['width'] || req.query['breadth'];
      const queryHeight = req.query['height'];
      const queryShipmentMode = req.query['shipment_mode'] || req.query['mode'];

      const { ShiprocketService } = await import('../services/shiprocket.service');
      const shiprocket = new ShiprocketService();

      const rates = await shiprocket.getServiceableCouriers({
        delivery_pincode: pincode,
        weight: totalWeight,
        cod,
        declared_value: declaredValue,
        length: queryLength ? Number(queryLength) : 10,
        width: queryWidth ? Number(queryWidth) : 10,
        height: queryHeight ? Number(queryHeight) : 10,
        shipment_mode: queryShipmentMode as any
      });

      res.json({
        success: true,
        pincode,
        cod,
        declared_value: declaredValue,
        data: rates
      });
    } catch (err) {
      next(err);
    }
  }

  async getShipmentTracking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = Number(req.params['id']);
      const order = await this.service.getById(orderId);
      if (!order) throw new AppError('Order not found', 404);
      if (!order.tracking_number) throw new AppError('No tracking number for this order', 400);

      const { ShiprocketService } = await import('../services/shiprocket.service');
      const shiprocket = new ShiprocketService();
      const tracking = await shiprocket.getTrackingStatus(order.tracking_number);
      
      // Auto-sync status immediately on explicit admin tracking query
      const trackData = tracking?.tracking_data?.shipment_track?.[0];
      if (trackData && trackData.current_status) {
        await this.service.syncStatusWithShiprocket(orderId, order.status, trackData.current_status);
      }

      res.json({ success: true, data: tracking });
    } catch (err) {
      next(err);
    }
  }

  async bookShipment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = Number(req.params['id']);
      const { courier_company_id, courier_name, rate } = req.body;
      if (!courier_company_id || !courier_name) {
        throw new AppError('Courier details are required', 400);
      }

      const order = await this.service.getById(orderId);
      if (!order) throw new AppError('Order not found', 404);

      const { ShiprocketService } = await import('../services/shiprocket.service');
      const shiprocket = new ShiprocketService();
      const bookingRes = await shiprocket.bookShipment(order, req.body);

      if (bookingRes.success) {
        await this.service.updateTracking(orderId, {
          tracking_number: bookingRes.awb_code,
          courier_name,
          tracking_url: bookingRes.label_url
        });

        const { logActivity } = await import('../utils/activity-logger');
        logActivity({
          action: 'order_shipment_booked',
          userId: req.user?.userId,
          module: 'orders',
          referenceType: 'order',
          referenceId: orderId,
          newValues: {
            courier_company_id,
            courier_name,
            awb: bookingRes.awb_code,
            tracking_url: bookingRes.label_url,
            status: 'shipped'
          }
        });

        res.json({
          success: true,
          message: 'Shipment booked successfully',
          data: {
            tracking_number: bookingRes.awb_code,
            tracking_url: bookingRes.label_url
          }
        });
      } else {
        throw new AppError('Failed to book shipment with Shiprocket', 500);
      }
    } catch (err) {
      next(err);
    }
  }

  async getAllStatuses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { db } = await import('../utils/database');
      const statuses = await db.query('SELECT * FROM order_statuses ORDER BY sort_order ASC');
      res.json({ success: true, data: statuses });
    } catch (err) {
      next(err);
    }
  }

  async updateStatusHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const historyId = Number(req.params['historyId']);
      const { status, note, date } = req.body;
      if (!status) throw new AppError('Status is required', 400);

      await this.service.updateStatusHistory(historyId, { status, note, created_at: date });
      res.json({ success: true, message: 'Order status history updated successfully' });
    } catch (err) { next(err); }
  }

  async deleteStatusHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const historyId = Number(req.params['historyId']);
      await this.service.deleteStatusHistory(historyId);
      res.json({ success: true, message: 'Order status history deleted successfully' });
    } catch (err) { next(err); }
  }
}
