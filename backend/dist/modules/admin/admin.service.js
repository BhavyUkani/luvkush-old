"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const database_1 = require("../../utils/database");
const cache_1 = require("../../utils/cache");
// Sargable day/week/month boundaries, used in place of DATE(created_at) = ...
// / YEARWEEK(created_at, 1) = ... / MONTH(created_at) = ... comparisons.
// Wrapping an indexed column in a function (the previous form) forces MySQL
// to evaluate that function per row and blocks it from using an index range
// scan on created_at; comparing the bare column against a constant range
// keeps idx_orders_status's neighbouring created_at lookups (and any future
// index on created_at) usable.
const TODAY_START = 'CURDATE()';
const TODAY_END = 'CURDATE() + INTERVAL 1 DAY';
// WEEKDAY() is 0 for Monday, matching YEARWEEK(x, 1)'s Monday-start weeks.
const WEEK_START = 'DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)';
const WEEK_END = `${WEEK_START} + INTERVAL 7 DAY`;
const MONTH_START = "DATE_FORMAT(CURDATE(), '%Y-%m-01')";
const MONTH_END = "DATE_FORMAT(CURDATE() + INTERVAL 1 MONTH, '%Y-%m-01')";
const DASHBOARD_CACHE_KEY = 'admin:dashboard-stats';
const DASHBOARD_CACHE_TTL_MS = 60_000;
// A partial refund deliberately leaves orders.payment_status = 'paid' — the
// refunded amount only ever lands in the payment_transactions ledger (see
// payment.service.ts#initiateRefund) — so filtering on payment_status alone
// only catches orders that were refunded *in full*. This nets out whatever
// was actually refunded (partial or full) from every paid/refunded order,
// so revenue figures reflect what was actually kept rather than what was
// originally charged.
function netRevenueOrdersSubquery(extraWhere = '') {
    return `
    SELECT o.id, o.created_at, o.discount_amount,
      o.total_amount - COALESCE(r.refunded, 0) as net_amount
    FROM orders o
    LEFT JOIN (
      SELECT order_id, SUM(amount) as refunded
      FROM payment_transactions
      WHERE status = 'refunded'
      GROUP BY order_id
    ) r ON r.order_id = o.id
    WHERE o.payment_status IN ('paid', 'refunded')
    ${extraWhere}
  `;
}
class AdminService {
    async getDashboardStats() {
        // Dashboard aggregates are read-heavy (every admin page load re-renders
        // them) and only need to be accurate to within about a minute — caching
        // avoids re-running all 8 queries on every request.
        return (0, cache_1.getOrSetCache)(DASHBOARD_CACHE_KEY, DASHBOARD_CACHE_TTL_MS, () => this.computeDashboardStats());
    }
    async computeDashboardStats() {
        const [orders, revenue, customers, products, profit] = await Promise.all([
            database_1.db.queryOne(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
          SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
          SUM(CASE WHEN created_at >= ${TODAY_START} AND created_at < ${TODAY_END} THEN 1 ELSE 0 END) as today,
          SUM(CASE WHEN created_at >= ${WEEK_START} AND created_at < ${WEEK_END} THEN 1 ELSE 0 END) as this_week
        FROM orders WHERE status != 'cancelled'
      `),
            database_1.db.queryOne(`
        SELECT
          SUM(net_amount) as total,
          SUM(CASE WHEN created_at >= ${TODAY_START} AND created_at < ${TODAY_END} THEN net_amount ELSE 0 END) as today,
          SUM(CASE WHEN created_at >= ${WEEK_START} AND created_at < ${WEEK_END} THEN net_amount ELSE 0 END) as this_week,
          SUM(CASE WHEN created_at >= ${MONTH_START} AND created_at < ${MONTH_END} THEN net_amount ELSE 0 END) as this_month
        FROM (${netRevenueOrdersSubquery()}) net
      `),
            database_1.db.queryOne(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN created_at >= ${TODAY_START} AND created_at < ${TODAY_END} THEN 1 ELSE 0 END) as today,
          SUM(CASE WHEN created_at >= ${WEEK_START} AND created_at < ${WEEK_END} THEN 1 ELSE 0 END) as this_week
        FROM users WHERE role = 'customer'
      `),
            database_1.db.queryOne(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
          SUM(CASE WHEN stock_quantity > 0 AND stock_quantity <= 10 THEN 1 ELSE 0 END) as low_stock
        FROM products
      `),
            // Only items with a real cost_price contribute to profit — assuming a
            // margin for the rest (the old COALESCE(..., unit_price * 0.6)) would
            // present a guess as a real figure. excluded_items counts how many
            // paid order_items were left out for missing cost data, so the
            // dashboard can flag the total as partial instead of implying it's
            // complete.
            database_1.db.queryOne(`
        SELECT
          SUM(CASE WHEN p.cost_price IS NOT NULL THEN oi.quantity * (oi.unit_price - p.cost_price) ELSE 0 END) as total,
          SUM(CASE WHEN p.cost_price IS NOT NULL AND o.created_at >= ${TODAY_START} AND o.created_at < ${TODAY_END} THEN oi.quantity * (oi.unit_price - p.cost_price) ELSE 0 END) as today,
          SUM(CASE WHEN p.cost_price IS NOT NULL AND o.created_at >= ${MONTH_START} AND o.created_at < ${MONTH_END} THEN oi.quantity * (oi.unit_price - p.cost_price) ELSE 0 END) as this_month,
          SUM(CASE WHEN p.cost_price IS NULL THEN 1 ELSE 0 END) as excluded_items
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.payment_status = 'paid'
      `)
        ]);
        const recentOrders = await database_1.db.query(`
      SELECT o.id, o.order_number, o.status, o.total_amount, o.created_at,
        u.first_name, u.last_name
      FROM orders o JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC LIMIT 10
    `);
        const topProducts = await database_1.db.query(`
      SELECT p.id, p.name, p.slug, p.primary_image, p.price, p.sales_count, p.stock_quantity
      FROM products p WHERE p.status = 'active'
      ORDER BY p.sales_count DESC LIMIT 10
    `);
        const revenueChart = await database_1.db.query(`
      SELECT
        DATE(created_at) as date,
        SUM(net_amount) as revenue,
        COUNT(*) as orders
      FROM (${netRevenueOrdersSubquery('AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)')}) net
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
        return { orders, revenue, customers, products, profit, recentOrders, topProducts, revenueChart };
    }
    async getCustomers(page = 1, limit = 20, search) {
        const conditions = ["role = 'customer'"];
        const params = [];
        if (search) {
            conditions.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)');
            const t = `%${search}%`;
            params.push(t, t, t);
        }
        const sql = `
      SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.status, u.created_at,
        COUNT(DISTINCT o.id) as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id AND o.payment_status = 'paid'
      WHERE ${conditions.join(' AND ')}
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;
        return database_1.db.paginate(sql, params, page, limit);
    }
    async getInventoryAlerts() {
        const [outOfStock, lowStock] = await Promise.all([
            database_1.db.query(`
        SELECT id, name, slug, sku, stock_quantity, primary_image
        FROM products WHERE status = 'active' AND stock_quantity = 0
        ORDER BY sales_count DESC
      `),
            database_1.db.query(`
        SELECT id, name, slug, sku, stock_quantity, primary_image
        FROM products WHERE status = 'active' AND stock_quantity > 0 AND stock_quantity <= 10
        ORDER BY stock_quantity ASC
      `)
        ]);
        return { out_of_stock: outOfStock, low_stock: lowStock };
    }
    async updateInventory(productId, quantity) {
        await database_1.db.query('UPDATE products SET stock_quantity = ?, updated_at = NOW() WHERE id = ?', [quantity, productId]);
    }
    async getRevenueReport(period) {
        const groupBy = period === 'daily'
            ? 'DATE(created_at)'
            : period === 'weekly'
                ? 'YEARWEEK(created_at, 1)'
                : 'DATE_FORMAT(created_at, "%Y-%m")';
        const intervalValue = period === 'daily' ? 30 : 12;
        const intervalUnit = period === 'daily' ? 'DAY' : period === 'weekly' ? 'WEEK' : 'MONTH';
        return database_1.db.query(`
      SELECT
        ${groupBy} as period,
        COUNT(*) as orders,
        SUM(net_amount) as revenue,
        SUM(discount_amount) as discounts,
        AVG(net_amount) as avg_order_value
      FROM (${netRevenueOrdersSubquery(`AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL ${intervalValue} ${intervalUnit})`)}) net
      GROUP BY ${groupBy}
      ORDER BY period ASC
    `);
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=admin.service.js.map