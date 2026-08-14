import { PoolConnection } from 'mysql2/promise';
import { db } from '../../utils/database';
import { logger } from '../../utils/logger';
import { AppError } from '../../middleware/error.middleware';
import { CouponService } from '../coupon/coupon.service';
import { CartService } from '../cart/cart.service';
import { randomToken } from '../../utils/helpers';
import { logActivity } from '../../utils/activity-logger';
import { calculateShippingCost, calculateTax, ShippingMethod } from '../../config/business-rules';

const couponService = new CouponService();
const cartService = new CartService();

const TERMINAL_STATUSES = ['cancelled', 'refunded', 'returned'];
const RESTOCK_STATUSES = ['cancelled', 'returned'];

// Fixed pipeline position for the built-in ("system") statuses only —
// admins can define arbitrary extra statuses via order_statuses
// (is_system = 0) for custom workflows, and those intentionally fall
// outside this ranking so they stay unconstrained. Within the known
// pipeline, this is what actually stops something like delivered→pending.
const STATUS_RANK: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  quality_check: 3,
  shipped: 4,
  out_for_delivery: 5,
  delivered: 6
};

/** True if `to` would move a known-pipeline order backward. Moves into a
 * terminal status (cancel/return/refund) or moves involving a custom status
 * are never considered illegal here — see STATUS_RANK comment. */
function isBackwardTransition(from: string, to: string): boolean {
  if (from === to || TERMINAL_STATUSES.includes(to)) return false;
  const fromRank = STATUS_RANK[from];
  const toRank = STATUS_RANK[to];
  if (fromRank === undefined || toRank === undefined) return false;
  return toRank < fromRank;
}

interface CreateOrderData {
  shipping_address: Record<string, any>;
  coupon_code?: string;
  notes?: string;
  payment_method: string;
  shipping_method?: string;
}

export class OrderService {
  async createFromCart(userId: number, data: CreateOrderData) {
    const cart = await cartService.getCart(userId);
    if (!cart.items || cart.items.length === 0) throw new AppError('Cart is empty', 400);

    // Verify all items still available (a fast pre-check; the authoritative
    // check happens inside the transaction below via a conditional UPDATE,
    // which is what actually prevents concurrent checkouts from overselling
    // the last unit).
    for (const item of cart.items as any[]) {
      if (item.product_status !== 'active') {
        throw new AppError(`"${item.name}" is no longer available`, 400);
      }
      const currentStock = item.variant_id ? item.variant_stock : item.stock_quantity;
      if (currentStock < item.quantity) {
        throw new AppError(`Insufficient stock for "${item.name}"`, 400);
      }
    }

    const subtotal = (cart as any).subtotal;
    let discount = 0;
    let couponCode: string | null = null;
    let freeShipping = false;

    if (data.coupon_code) {
      // Let an invalid/expired/exhausted coupon fail loudly — silently
      // dropping it would charge the customer more than the total they
      // were shown on the review screen.
      const { coupon, discount: d } = await couponService.validate(data.coupon_code, userId, subtotal);
      discount = d;
      couponCode = coupon.code;
      freeShipping = coupon.discount_type === 'free_shipping';
    }

    const shippingMethod: ShippingMethod = data.shipping_method === 'express' ? 'express' : 'standard';
    const shippingCost = calculateShippingCost(subtotal - discount, shippingMethod, freeShipping);
    const taxAmount = calculateTax(subtotal - discount);
    const totalAmount = subtotal - discount + shippingCost + taxAmount;

    const shippingAddressJson = JSON.stringify(data.shipping_address);

    // Order numbers are randomly generated against a UNIQUE column — retry
    // a bounded number of times on collision rather than losing the order.
    const MAX_ATTEMPTS = 3;
    let lastError: any;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const orderNumber = this.generateOrderNumber();
      try {
        const createdOrderId = await db.transaction(async (conn) => {
          const [orderResult] = await conn.execute<any>(`
            INSERT INTO orders (
              user_id, order_number, status, payment_status, payment_method, shipping_method,
              subtotal, discount_amount, shipping_amount, tax_amount, total_amount,
              coupon_code, coupon_discount,
              shipping_address,
              special_instructions, created_at, updated_at
            ) VALUES (?, ?, 'pending', 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          `, [
            userId, orderNumber, data.payment_method, shippingMethod,
            subtotal, discount, shippingCost, taxAmount, totalAmount,
            couponCode, discount,
            shippingAddressJson,
            data.notes || null
          ]);

          const orderId = orderResult.insertId;

          // Insert order items and decrement stock atomically, inside the
          // same transaction as the availability check itself: the UPDATE's
          // WHERE clause is the actual concurrency guard — two simultaneous
          // checkouts for the last unit can no longer both succeed.
          for (const item of cart.items as any[]) {
            const unitPrice = item.variant_id
              ? item.price + (item.price_modifier || 0)
              : item.price;
            const lineTotal = unitPrice * item.quantity;

            await conn.execute(`
              INSERT INTO order_items (order_id, product_id, variant_id, product_name, variant_name, quantity, unit_price, mrp, total_amount, primary_image)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [orderId, item.product_id, item.variant_id || null, item.name, item.variant_name || null, item.quantity, unitPrice, item.mrp || unitPrice, lineTotal, item.primary_image || null]);

            if (item.variant_id) {
              const [result] = await conn.execute<any>(
                'UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?',
                [item.quantity, item.variant_id, item.quantity]
              );
              if (result.affectedRows === 0) {
                throw new AppError(`"${item.name}" no longer has enough stock`, 409);
              }
            } else {
              const [result] = await conn.execute<any>(
                'UPDATE products SET stock_quantity = stock_quantity - ?, sales_count = sales_count + ? WHERE id = ? AND stock_quantity >= ?',
                [item.quantity, item.quantity, item.product_id, item.quantity]
              );
              if (result.affectedRows === 0) {
                throw new AppError(`"${item.name}" no longer has enough stock`, 409);
              }
            }
          }

          // Increment coupon usage — guarded the same way, so a coupon that
          // hits its usage_limit mid-checkout can't be oversold either.
          if (couponCode) {
            const [couponResult] = await conn.execute<any>(
              'UPDATE coupons SET usage_count = usage_count + 1 WHERE code = ? AND (usage_limit IS NULL OR usage_count < usage_limit)',
              [couponCode]
            );
            if (couponResult.affectedRows === 0) {
              throw new AppError('This coupon has just reached its usage limit', 409);
            }
          }

          // Clear cart only for COD — for Razorpay/online, cart is cleared after payment verification
          if (data.payment_method !== 'razorpay' && data.payment_method !== 'online') {
            await conn.execute('DELETE FROM cart_items WHERE cart_id = ?', [(cart as any).cart_id]);
          }

          return orderId;
        });

        return this.getById(createdOrderId, userId);
      } catch (err: any) {
        lastError = err;
        if (err?.code !== 'ER_DUP_ENTRY') throw err;
        // Order-number collision — loop and retry with a freshly generated number.
      }
    }
    throw lastError;
  }

  async getById(orderId: number, userId?: number) {
    const whereExtra = userId ? 'AND o.user_id = ?' : '';
    const params = userId ? [orderId, userId] : [orderId];

    const order = await db.queryOne<any>(`
      SELECT o.id, o.user_id, o.order_number, o.status, o.payment_status, o.payment_method, o.shipping_method,
        o.subtotal, o.discount_amount, o.shipping_amount, o.tax_amount, o.total_amount,
        o.coupon_code, o.coupon_discount, o.shipping_address, o.special_instructions,
        o.tracking_number, o.tracking_url, o.shiprocket_order_id, o.shiprocket_shipment_id,
        o.advance_paid_amount, o.paid_at, o.created_at, o.updated_at,
        u.first_name, u.last_name, u.email, u.phone as user_phone,
        os.name as status_name, os.color as status_color
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_statuses os ON o.status = os.slug
      WHERE o.id = ? ${whereExtra}
    `, params);

    if (!order) return null;

    // Auto-sync with Shiprocket tracking status if tracking number exists and status is non-terminal
    if (order.tracking_number && !['delivered', 'cancelled', 'returned', 'refunded'].includes(order.status)) {
      // Check if last updated is more than 15 minutes ago
      const timeDiff = Date.now() - new Date(order.updated_at).getTime();
      if (timeDiff > 15 * 60 * 1000) {
        try {
          const { ShiprocketService } = await import('../../shared/shiprocket.service');
          const shiprocket = new ShiprocketService();
          // A slow/unreachable Shiprocket API must not stall this page load —
          // give it a hard ceiling and fall back to the last-known status.
          const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Shiprocket tracking lookup timed out')), 5000)
          );
          const tracking = await Promise.race([shiprocket.getTrackingStatus(order.tracking_number), timeout]);
          const trackData = tracking?.tracking_data?.shipment_track?.[0];
          if (trackData && trackData.current_status) {
            const synced = await this.syncStatusWithShiprocket(orderId, order.status, trackData.current_status);
            if (synced) {
              // Re-fetch order status fields to return updated values
              const updated = await db.queryOne<{ status: string; updated_at: Date }>(
                'SELECT status, updated_at FROM orders WHERE id = ?',
                [orderId]
              );
              if (updated) {
                order.status = updated.status;
                order.updated_at = updated.updated_at;
                const os = await db.queryOne<{ name: string; color: string }>(
                  'SELECT name, color FROM order_statuses WHERE slug = ?',
                  [updated.status]
                );
                if (os) {
                  order.status_name = os.name;
                  order.status_color = os.color;
                }
              }
            }
          }
        } catch (err) {
          // Log and ignore so page load doesn't crash if Shiprocket API fails
          logger.error('Failed to auto-sync order status with Shiprocket:', err);
        }
      }
    }

    order.items = await db.query(`
      SELECT oi.*, p.slug as product_slug
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);

    return order;
  }

  async getByOrderNumber(orderNumber: string, userId?: number) {
    const whereExtra = userId ? 'AND o.user_id = ?' : '';
    const params = userId ? [orderNumber, userId] : [orderNumber];

    const order = await db.queryOne<any>(
      `SELECT o.id FROM orders o WHERE o.order_number = ? ${whereExtra}`,
      params
    );
    if (!order) return null;
    return this.getById(order.id);
  }

  async getUserOrders(userId: number, page = 1, limit = 10) {
    const sql = `
      SELECT o.id, o.order_number, o.status, o.payment_status, o.total_amount,
        o.created_at, os.name as status_name, os.color as status_color
      FROM orders o
      LEFT JOIN order_statuses os ON o.status = os.slug
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `;
    const paginated = await db.paginate<any>(sql, [userId], page, limit);

    if (paginated.data && paginated.data.length > 0) {
      const orderIds = paginated.data.map(o => o.id);
      const items = await db.query(`
        SELECT oi.*, p.slug as product_slug
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id IN (${orderIds.map(() => '?').join(',')})
      `, orderIds);

      // Group items by order_id
      const itemsByOrderId = items.reduce((acc: any, item: any) => {
        if (!acc[item.order_id]) acc[item.order_id] = [];
        acc[item.order_id].push(item);
        return acc;
      }, {});

      for (const order of paginated.data) {
        order.items = itemsByOrderId[order.id] || [];
      }
    }

    return paginated;
  }

  async getStatusCounts(): Promise<Record<string, number>> {
    const rows = await db.query<{ status: string; cnt: number }[]>(
      'SELECT status, COUNT(*) as cnt FROM orders GROUP BY status'
    );
    const counts: Record<string, number> = {};
    for (const r of rows) counts[r.status] = Number(r.cnt);
    return counts;
  }

  async adminGetAll(page = 1, limit = 20, filters: { status?: string; payment_status?: string; search?: string }) {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.status) { conditions.push('o.status = ?'); params.push(filters.status); }
    if (filters.payment_status) { conditions.push('o.payment_status = ?'); params.push(filters.payment_status); }
    if (filters.search) {
      conditions.push('(o.order_number LIKE ? OR u.email LIKE ? OR u.first_name LIKE ?)');
      const t = `%${filters.search}%`;
      params.push(t, t, t);
    }

    const sql = `
      SELECT o.id, o.order_number, o.status, o.payment_status, o.payment_method,
        o.total_amount, o.tracking_number, o.tracking_url, o.created_at,
        u.first_name, u.last_name, u.email, u.phone,
        os.name as status_name, os.color as status_color,
        COUNT(oi.id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_statuses os ON o.status = os.slug
      LEFT JOIN order_items oi ON oi.order_id = o.id
      ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    return db.paginate(sql, params, page, limit);
  }

  async updateStatus(orderId: number, status: string, note?: string | null, date?: string | null, changedBy?: number | null) {
    const statuses = await db.query<any[]>('SELECT slug FROM order_statuses');
    const validStatuses = statuses.map(s => s.slug);
    if (!validStatuses.includes(status)) throw new AppError('Invalid order status', 400);

    // Every side effect of a status change — the status itself, the audit
    // history row, stock restoration, and the coupon usage decrement — is
    // one atomic unit: a failure partway through (e.g. the history insert)
    // must not leave stock restored against a status update that never
    // actually committed, or vice versa.
    await db.transaction(async (conn) => {
      const [rows] = await conn.execute<any>(
        'SELECT id, status, coupon_code FROM orders WHERE id = ? FOR UPDATE',
        [orderId]
      );
      const order = rows[0];
      if (!order) throw new AppError('Order not found', 404);

      if (TERMINAL_STATUSES.includes(order.status) && order.status !== status) {
        throw new AppError(`Order is already ${order.status} and cannot be moved to ${status}`, 400);
      }
      if (isBackwardTransition(order.status, status)) {
        throw new AppError(`Cannot move an order from "${order.status}" back to "${status}"`, 400);
      }

      const previousStatus = order.status;
      await conn.execute('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [status, orderId]);

      const historyDate = date ? new Date(date) : new Date();
      await conn.execute(
        'INSERT INTO order_status_history (order_id, status, note, changed_by, created_at) VALUES (?, ?, ?, ?, ?)',
        [orderId, status, note || null, changedBy || null, historyDate]
      );

      // Restore stock exactly once, only on the transition INTO a
      // restock-eligible status (not on repeat updates that are already
      // there — an admin double-clicking "cancel" must not double-restore
      // inventory).
      if (RESTOCK_STATUSES.includes(status) && !RESTOCK_STATUSES.includes(previousStatus)) {
        const [items] = await conn.execute<any>('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
        for (const item of items) {
          if (item.variant_id) {
            await conn.execute('UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?', [item.quantity, item.variant_id]);
          } else {
            await conn.execute('UPDATE products SET stock_quantity = stock_quantity + ?, sales_count = GREATEST(0, sales_count - ?) WHERE id = ?', [item.quantity, item.quantity, item.product_id]);
          }
        }
      }

      // Cancelling a coupon-bearing order frees up its usage slot again.
      if (status === 'cancelled' && previousStatus !== 'cancelled' && order.coupon_code) {
        await conn.execute(
          'UPDATE coupons SET usage_count = GREATEST(0, usage_count - 1) WHERE code = ? AND usage_count > 0',
          [order.coupon_code]
        );
      }
    });
  }

  async getStatusHistory(orderId: number) {
    try {
      return await db.query<any[]>(`
        SELECT h.id, h.order_id, h.status, h.note, h.changed_by, h.created_at,
               os.name AS status_name, os.color AS status_color
        FROM order_status_history h
        LEFT JOIN order_statuses os ON h.status COLLATE utf8mb4_unicode_ci = os.slug
        WHERE h.order_id = ?
        ORDER BY h.created_at ASC
      `, [orderId]);
    } catch (err) {
      logger.error('[OrderService] Failed to load status history:', err);
      return [];
    }
  }

  async updateTracking(orderId: number, data: { tracking_number: string; courier_name?: string; tracking_url?: string }) {
    const order = await db.queryOne<any>('SELECT status FROM orders WHERE id = ?', [orderId]);
    if (!order) throw new AppError('Order not found', 404);

    // Attaching a tracking number to an order that has already progressed
    // past "shipped" (e.g. delivered) must not silently rewind its status.
    const alreadyBeyondShipped = ['out_for_delivery', 'delivered', ...TERMINAL_STATUSES].includes(order.status);
    const nextStatus = alreadyBeyondShipped ? order.status : 'shipped';

    await db.query(
      'UPDATE orders SET tracking_number = ?, tracking_url = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [data.tracking_number, data.tracking_url || null, nextStatus, orderId]
    );

    if (nextStatus !== order.status) {
      try {
        await db.query(
          "INSERT INTO order_status_history (order_id, status, note, created_at) VALUES (?, ?, 'Tracking number attached', NOW())",
          [orderId, nextStatus]
        );
      } catch (err) {
        logger.error('[OrderService] Failed to save status history for tracking update:', err);
      }
    }
  }

  async cancelOrder(orderId: number, userId: number, reason: string) {
    const order = await db.queryOne<any>(
      'SELECT id, status, user_id FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );
    if (!order) throw new AppError('Order not found', 404);

    const cancellable = ['pending', 'confirmed'];
    if (!cancellable.includes(order.status)) {
      throw new AppError('Order cannot be cancelled at this stage', 400);
    }

    await this.updateStatus(orderId, 'cancelled', `Customer cancellation: ${reason}`);
  }

  async abortOnlineOrder(orderId: number, userId: number) {
    await db.transaction(async (conn) => {
      // Lock the row for the duration of the transaction so a webhook or a
      // second abort call racing this one can't act on stale state.
      const [rows] = await conn.execute<any>(
        'SELECT id, status, payment_status, payment_method FROM orders WHERE id = ? AND user_id = ? FOR UPDATE',
        [orderId, userId]
      );
      const order = rows[0];
      if (!order) throw new AppError('Order not found', 404);
      if (order.payment_status === 'paid') throw new AppError('Cannot abort a paid order', 400);
      if (!['razorpay', 'online'].includes(order.payment_method)) {
        throw new AppError('Only online payments can be aborted this way', 400);
      }

      await this.releaseReservedStockAndDeleteOrder(conn, orderId);
    });
  }

  // Sweeps online-payment orders that were left in status='pending',
  // payment_status='pending' past the abandonment window — the same
  // outcome as abortOnlineOrder(), but for checkouts where the browser
  // was closed/crashed before the modal-dismiss handler ever ran, so
  // stock would otherwise stay reserved forever.
  async releaseAbandonedOnlineOrders(olderThanMinutes: number): Promise<number> {
    const candidates = await db.query<any[]>(
      `SELECT id FROM orders
       WHERE payment_method IN ('razorpay', 'online')
         AND status = 'pending' AND payment_status = 'pending'
         AND updated_at < DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
      [olderThanMinutes]
    );

    let released = 0;
    for (const { id } of candidates) {
      try {
        await db.transaction(async (conn) => {
          // Re-check under lock: a payment could have been verified or a
          // webhook could have landed between the SELECT above and now.
          const [rows] = await conn.execute<any>(
            "SELECT id FROM orders WHERE id = ? AND status = 'pending' AND payment_status = 'pending' FOR UPDATE",
            [id]
          );
          if (!rows[0]) return;
          await this.releaseReservedStockAndDeleteOrder(conn, id);
        });
        released++;
      } catch (err) {
        logger.error(`[OrderService] Failed to release abandoned order ${id}:`, err);
      }
    }

    if (released > 0) {
      logger.info(`[OrderService] Released stock for ${released} abandoned online checkout(s)`);
    }
    return released;
  }

  private async releaseReservedStockAndDeleteOrder(conn: PoolConnection, orderId: number) {
    const [items] = await conn.execute<any>('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    for (const item of items) {
      if (item.variant_id) {
        await conn.execute('UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?', [item.quantity, item.variant_id]);
      } else if (item.product_id) {
        await conn.execute(
          'UPDATE products SET stock_quantity = stock_quantity + ?, sales_count = GREATEST(0, sales_count - ?) WHERE id = ?',
          [item.quantity, item.quantity, item.product_id]
        );
      }
    }

    await conn.execute('DELETE FROM order_items WHERE order_id = ?', [orderId]);
    await conn.execute('DELETE FROM orders WHERE id = ?', [orderId]);
  }

  async syncStatusWithShiprocket(orderId: number, currentDbStatus: string, srStatus: string): Promise<boolean> {
    const s = srStatus.toLowerCase();
    let mappedStatus = '';

    if (s.includes('delivered')) mappedStatus = 'delivered';
    else if (s.includes('out for delivery') || s.includes('out_for_delivery')) mappedStatus = 'out_for_delivery';
    else if (s.includes('in transit') || s.includes('transit') || s.includes('shipped')) mappedStatus = 'shipped';
    else if (s.includes('picked') || s.includes('pickup done') || s.includes('pickup scheduled')) mappedStatus = 'processing';
    else if (s.includes('cancelled') || s.includes('canceled')) mappedStatus = 'cancelled';
    else if (s.includes('returned') || s.includes('rto')) mappedStatus = 'returned';

    if (mappedStatus && mappedStatus !== currentDbStatus) {
      // Validate that mappedStatus exists in order_statuses
      const exists = await db.queryOne('SELECT id FROM order_statuses WHERE slug = ?', [mappedStatus]);
      if (exists) {
        await db.query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [mappedStatus, orderId]);
        try {
          await db.query(`
            INSERT INTO order_status_history (order_id, status, note, changed_by, created_at)
            VALUES (?, ?, 'Auto-synced with Shiprocket tracking', NULL, NOW())
          `, [orderId, mappedStatus]);
        } catch { /* history table may not exist yet */ }
        return true;
      }
    }
    return false;
  }

  async updateStatusHistory(historyId: number, data: { status: string; note?: string | null; created_at?: string | null }, changedBy?: number | null) {
    const statuses = await db.query<any[]>('SELECT slug FROM order_statuses');
    const validStatuses = statuses.map(s => s.slug);
    if (!validStatuses.includes(data.status)) throw new AppError('Invalid order status', 400);

    const existing = await db.queryOne<any>('SELECT id, order_id, status, note FROM order_status_history WHERE id = ?', [historyId]);
    if (!existing) throw new AppError('History entry not found', 404);

    const historyDate = data.created_at ? new Date(data.created_at) : new Date();
    await db.query(
      'UPDATE order_status_history SET status = ?, note = ?, created_at = ? WHERE id = ?',
      [data.status, data.note || null, historyDate, historyId]
    );

    // The audit trail editing its own entries unlogged would defeat the
    // point of an audit trail — record who changed what.
    logActivity({
      action: 'order_status_changed',
      userId: changedBy,
      module: 'orders',
      referenceType: 'order_status_history',
      referenceId: historyId,
      oldValues: { order_id: existing.order_id, status: existing.status, note: existing.note },
      newValues: { order_id: existing.order_id, status: data.status, note: data.note }
    });
  }

  async deleteStatusHistory(historyId: number, changedBy?: number | null) {
    const existing = await db.queryOne<any>('SELECT id, order_id, status, note FROM order_status_history WHERE id = ?', [historyId]);
    if (!existing) throw new AppError('History entry not found', 404);

    await db.query('DELETE FROM order_status_history WHERE id = ?', [historyId]);

    logActivity({
      action: 'order_status_changed',
      userId: changedBy,
      module: 'orders',
      referenceType: 'order_status_history',
      referenceId: historyId,
      oldValues: { order_id: existing.order_id, status: existing.status, note: existing.note, deleted: true }
    });
  }

  private generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = randomToken(6);
    return `LKN${year}${month}${day}${random}`;
  }
}
