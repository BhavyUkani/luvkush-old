import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { ProductService } from '../services/product.service';
import { AppError } from '../middleware/error.middleware';

export class AdminController {
  private service = new AdminService();
  private productService = new ProductService();

  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.service.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (err) { next(err); }
  }

  async getCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, search } = req.query;
      const result = await this.service.getCustomers(Number(page), Number(limit), search as string);
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }

  async getInventoryAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await this.service.getInventoryAlerts();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async updateInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quantity } = req.body;
      if (quantity === undefined || quantity < 0) throw new AppError('Valid quantity is required', 400);
      await this.service.updateInventory(Number(req.params['productId']), Number(quantity));
      res.json({ success: true, message: 'Inventory updated' });
    } catch (err) { next(err); }
  }

  async getRevenueReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const period = (req.query['period'] || 'daily') as 'daily' | 'weekly' | 'monthly';
      const data = await this.service.getRevenueReport(period);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, search, status, category } = req.query;
      const result = await this.productService.getAdminAll({
        page: Number(page),
        limit: Math.min(Number(limit), 100),
        search: search as string,
        status: status as string,
        category: category as string
      });
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }

  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await this.productService.getAdminById(Number(req.params['id']));
      if (!product) throw new AppError('Product not found', 404);
      res.json({ success: true, data: product });
    } catch (err) { next(err); }
  }

  async patchProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params['productId']);
      const { is_featured, is_bestseller, is_new, status, stock_quantity } = req.body;
      await this.productService.patch(id, { is_featured, is_bestseller, is_new, status, stock_quantity });
      res.json({ success: true, message: 'Product updated' });
    } catch (err) { next(err); }
  }

  async calculateShiprocketRates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        pickup_pincode,
        delivery_pincode,
        weight,
        cod,
        declared_value,
        length,
        width,
        height,
        shipment_mode,
        parcel_type
      } = req.body;

      if (!delivery_pincode) {
        throw new AppError('Delivery pincode is required', 400);
      }
      if (weight === undefined || weight === null) {
        throw new AppError('Weight is required', 400);
      }

      const { ShiprocketService } = await import('../services/shiprocket.service');
      const shiprocket = new ShiprocketService();

      const inputWeight = Number(weight);
      const lengthVal = length ? Number(length) : 0;
      const widthVal = width ? Number(width) : 0;
      const heightVal = height ? Number(height) : 0;
      const volumetricWeight = (lengthVal && widthVal && heightVal) ? (lengthVal * widthVal * heightVal) / 5000 : 0;
      const chargeableWeight = Math.max(inputWeight, volumetricWeight);

      let pickupPin = pickup_pincode ? String(pickup_pincode) : undefined;
      let deliveryPin = String(delivery_pincode);

      // Handle reverse shipping by swapping pincodes
      if (parcel_type === 'reverse') {
        const temp = pickupPin;
        pickupPin = deliveryPin;
        deliveryPin = temp || '360002';
      }

      // Determine COD flag based on parcel_type (if provided) or fallback to cod
      let isCod = Boolean(cod);
      if (parcel_type) {
        isCod = parcel_type === 'cod';
      }

      const params = {
        pickup_pincode: pickupPin,
        delivery_pincode: deliveryPin,
        weight: chargeableWeight,
        cod: isCod,
        declared_value: declared_value !== undefined ? Number(declared_value) : 0,
        length: length ? Number(length) : undefined,
        width: width ? Number(width) : undefined,
        height: height ? Number(height) : undefined,
        shipment_mode: shipment_mode as 'road' | 'air' | undefined
      };

      const rates = await shiprocket.getServiceableCouriers(params);

      res.json({
        success: true,
        data: rates
      });
    } catch (err) {
      next(err);
    }
  }

  async getAllOrderStatuses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { db } = await import('../utils/database');
      const statuses = await db.query('SELECT * FROM order_statuses ORDER BY sort_order ASC');
      res.json({ success: true, data: statuses });
    } catch (err) { next(err); }
  }

  async createOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, color } = req.body;
      if (!name) throw new AppError('Status name is required', 400);

      const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (!slug) throw new AppError('Invalid status name', 400);

      const { db } = await import('../utils/database');
      const existing = await db.queryOne('SELECT id FROM order_statuses WHERE slug = ?', [slug]);
      if (existing) throw new AppError('Status with this name or slug already exists', 400);

      const maxOrderRes = await db.queryOne<any>('SELECT MAX(sort_order) as max_order FROM order_statuses');
      const maxOrder = maxOrderRes?.max_order || 0;

      await db.query(`
        INSERT INTO order_statuses (name, slug, color, sort_order, is_system)
        VALUES (?, ?, ?, ?, FALSE)
      `, [name.trim(), slug, color || '#B87333', maxOrder + 1]);

      res.status(201).json({ success: true, message: 'Custom order status created successfully' });
    } catch (err) { next(err); }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params['id']);
      const { name, color } = req.body;
      if (!name) throw new AppError('Status name is required', 400);

      const { db } = await import('../utils/database');
      const status = await db.queryOne<any>('SELECT * FROM order_statuses WHERE id = ?', [id]);
      if (!status) throw new AppError('Status not found', 404);

      if (status.is_system) {
        await db.query('UPDATE order_statuses SET name = ?, color = ? WHERE id = ?', [name.trim(), color || status.color, id]);
      } else {
        const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (!slug) throw new AppError('Invalid status name', 400);

        const duplicate = await db.queryOne('SELECT id FROM order_statuses WHERE slug = ? AND id != ?', [slug, id]);
        if (duplicate) throw new AppError('Status with this name or slug already exists', 400);

        await db.query('UPDATE order_statuses SET name = ?, slug = ?, color = ? WHERE id = ?', [name.trim(), slug, color || status.color, id]);
      }

      res.json({ success: true, message: 'Order status updated successfully' });
    } catch (err) { next(err); }
  }

  async reorderOrderStatuses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) throw new AppError('Invalid status list format', 400);

      const { db } = await import('../utils/database');
      await db.transaction(async (conn) => {
        for (let i = 0; i < ids.length; i++) {
          await conn.execute('UPDATE order_statuses SET sort_order = ? WHERE id = ?', [i + 1, ids[i]]);
        }
      });

      res.json({ success: true, message: 'Order statuses reordered successfully' });
    } catch (err) { next(err); }
  }

  async deleteOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params['id']);
      const { db } = await import('../utils/database');
      
      const status = await db.queryOne<any>('SELECT * FROM order_statuses WHERE id = ?', [id]);
      if (!status) throw new AppError('Status not found', 404);
      if (status.is_system) throw new AppError('System statuses cannot be deleted', 400);

      const ordersCount = await db.queryOne<any>('SELECT COUNT(*) as count FROM orders WHERE status = ?', [status.slug]);
      if (ordersCount && ordersCount.count > 0) {
        throw new AppError('Cannot delete status because it is currently assigned to one or more orders. Please reassign those orders first.', 400);
      }

      await db.query('DELETE FROM order_statuses WHERE id = ?', [id]);
      res.json({ success: true, message: 'Custom order status deleted successfully' });
    } catch (err) { next(err); }
  }
}
