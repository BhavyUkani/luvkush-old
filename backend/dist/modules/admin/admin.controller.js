"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("./admin.service");
const product_service_1 = require("../product/product.service");
const error_middleware_1 = require("../../middleware/error.middleware");
class AdminController {
    service = new admin_service_1.AdminService();
    productService = new product_service_1.ProductService();
    async getDashboard(req, res, next) {
        try {
            const stats = await this.service.getDashboardStats();
            res.json({ success: true, data: stats });
        }
        catch (err) {
            next(err);
        }
    }
    async getCustomers(req, res, next) {
        try {
            const { page = 1, limit = 20, search } = req.query;
            const result = await this.service.getCustomers(Number(page), Number(limit), search);
            res.json({ success: true, ...result });
        }
        catch (err) {
            next(err);
        }
    }
    async getInventoryAlerts(req, res, next) {
        try {
            const data = await this.service.getInventoryAlerts();
            res.json({ success: true, data });
        }
        catch (err) {
            next(err);
        }
    }
    async updateInventory(req, res, next) {
        try {
            const { quantity } = req.body;
            if (quantity === undefined || quantity < 0)
                throw new error_middleware_1.AppError('Valid quantity is required', 400);
            await this.service.updateInventory(Number(req.params['productId']), Number(quantity));
            res.json({ success: true, message: 'Inventory updated' });
        }
        catch (err) {
            next(err);
        }
    }
    async getRevenueReport(req, res, next) {
        try {
            const period = (req.query['period'] || 'daily');
            const data = await this.service.getRevenueReport(period);
            res.json({ success: true, data });
        }
        catch (err) {
            next(err);
        }
    }
    async getProducts(req, res, next) {
        try {
            const { page = 1, limit = 20, search, status, category } = req.query;
            const result = await this.productService.getAdminAll({
                page: Number(page),
                limit: Math.min(Number(limit), 100),
                search: search,
                status: status,
                category: category
            });
            res.json({ success: true, ...result });
        }
        catch (err) {
            next(err);
        }
    }
    async getProductById(req, res, next) {
        try {
            const product = await this.productService.getAdminById(Number(req.params['id']));
            if (!product)
                throw new error_middleware_1.AppError('Product not found', 404);
            res.json({ success: true, data: product });
        }
        catch (err) {
            next(err);
        }
    }
    async patchProduct(req, res, next) {
        try {
            const id = Number(req.params['productId']);
            const { is_featured, is_bestseller, is_new, status, stock_quantity } = req.body;
            await this.productService.patch(id, { is_featured, is_bestseller, is_new, status, stock_quantity });
            res.json({ success: true, message: 'Product updated' });
        }
        catch (err) {
            next(err);
        }
    }
    async calculateShiprocketRates(req, res, next) {
        try {
            const { pickup_pincode, delivery_pincode, weight, cod, declared_value, length, width, height, shipment_mode, parcel_type } = req.body;
            if (!delivery_pincode) {
                throw new error_middleware_1.AppError('Delivery pincode is required', 400);
            }
            if (weight === undefined || weight === null) {
                throw new error_middleware_1.AppError('Weight is required', 400);
            }
            const { ShiprocketService } = await Promise.resolve().then(() => __importStar(require('../../shared/shiprocket.service')));
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
                shipment_mode: shipment_mode
            };
            const rates = await shiprocket.getServiceableCouriers(params);
            res.json({
                success: true,
                data: rates
            });
        }
        catch (err) {
            next(err);
        }
    }
    async getAllOrderStatuses(req, res, next) {
        try {
            const { db } = await Promise.resolve().then(() => __importStar(require('../../utils/database')));
            const statuses = await db.query('SELECT * FROM order_statuses ORDER BY sort_order ASC');
            res.json({ success: true, data: statuses });
        }
        catch (err) {
            next(err);
        }
    }
    async createOrderStatus(req, res, next) {
        try {
            const { name, color } = req.body;
            if (!name)
                throw new error_middleware_1.AppError('Status name is required', 400);
            const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            if (!slug)
                throw new error_middleware_1.AppError('Invalid status name', 400);
            const { db } = await Promise.resolve().then(() => __importStar(require('../../utils/database')));
            const existing = await db.queryOne('SELECT id FROM order_statuses WHERE slug = ?', [slug]);
            if (existing)
                throw new error_middleware_1.AppError('Status with this name or slug already exists', 400);
            const maxOrderRes = await db.queryOne('SELECT MAX(sort_order) as max_order FROM order_statuses');
            const maxOrder = maxOrderRes?.max_order || 0;
            await db.query(`
        INSERT INTO order_statuses (name, slug, color, sort_order, is_system)
        VALUES (?, ?, ?, ?, FALSE)
      `, [name.trim(), slug, color || '#B87333', maxOrder + 1]);
            res.status(201).json({ success: true, message: 'Custom order status created successfully' });
        }
        catch (err) {
            next(err);
        }
    }
    async updateOrderStatus(req, res, next) {
        try {
            const id = Number(req.params['id']);
            const { name, color } = req.body;
            if (!name)
                throw new error_middleware_1.AppError('Status name is required', 400);
            const { db } = await Promise.resolve().then(() => __importStar(require('../../utils/database')));
            const status = await db.queryOne('SELECT * FROM order_statuses WHERE id = ?', [id]);
            if (!status)
                throw new error_middleware_1.AppError('Status not found', 404);
            if (status.is_system) {
                await db.query('UPDATE order_statuses SET name = ?, color = ? WHERE id = ?', [name.trim(), color || status.color, id]);
            }
            else {
                const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                if (!slug)
                    throw new error_middleware_1.AppError('Invalid status name', 400);
                const duplicate = await db.queryOne('SELECT id FROM order_statuses WHERE slug = ? AND id != ?', [slug, id]);
                if (duplicate)
                    throw new error_middleware_1.AppError('Status with this name or slug already exists', 400);
                await db.query('UPDATE order_statuses SET name = ?, slug = ?, color = ? WHERE id = ?', [name.trim(), slug, color || status.color, id]);
            }
            res.json({ success: true, message: 'Order status updated successfully' });
        }
        catch (err) {
            next(err);
        }
    }
    async reorderOrderStatuses(req, res, next) {
        try {
            const { ids } = req.body;
            if (!Array.isArray(ids))
                throw new error_middleware_1.AppError('Invalid status list format', 400);
            const { db } = await Promise.resolve().then(() => __importStar(require('../../utils/database')));
            await db.transaction(async (conn) => {
                for (let i = 0; i < ids.length; i++) {
                    await conn.execute('UPDATE order_statuses SET sort_order = ? WHERE id = ?', [i + 1, ids[i]]);
                }
            });
            res.json({ success: true, message: 'Order statuses reordered successfully' });
        }
        catch (err) {
            next(err);
        }
    }
    async deleteOrderStatus(req, res, next) {
        try {
            const id = Number(req.params['id']);
            const { db } = await Promise.resolve().then(() => __importStar(require('../../utils/database')));
            const status = await db.queryOne('SELECT * FROM order_statuses WHERE id = ?', [id]);
            if (!status)
                throw new error_middleware_1.AppError('Status not found', 404);
            if (status.is_system)
                throw new error_middleware_1.AppError('System statuses cannot be deleted', 400);
            const ordersCount = await db.queryOne('SELECT COUNT(*) as count FROM orders WHERE status = ?', [status.slug]);
            if (ordersCount && ordersCount.count > 0) {
                throw new error_middleware_1.AppError('Cannot delete status because it is currently assigned to one or more orders. Please reassign those orders first.', 400);
            }
            await db.query('DELETE FROM order_statuses WHERE id = ?', [id]);
            res.json({ success: true, message: 'Custom order status deleted successfully' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map