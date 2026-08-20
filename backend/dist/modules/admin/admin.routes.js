"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("./admin.controller");
const product_controller_1 = require("../product/product.controller");
const category_controller_1 = require("../category/category.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const upload_middleware_1 = require("../../middleware/upload.middleware");
const router = (0, express_1.Router)();
const ctrl = new admin_controller_1.AdminController();
const productCtrl = new product_controller_1.ProductController();
const categoryCtrl = new category_controller_1.CategoryController();
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('super_admin', 'admin'));
// Dashboard & stats
router.get('/dashboard', ctrl.getDashboard.bind(ctrl));
// Shiprocket Rate Calculator
router.post('/shiprocket/calculate-rates', ctrl.calculateShiprocketRates.bind(ctrl));
// Customers
router.get('/customers', ctrl.getCustomers.bind(ctrl));
// Inventory
router.get('/inventory/alerts', ctrl.getInventoryAlerts.bind(ctrl));
router.patch('/inventory/:productId', ctrl.updateInventory.bind(ctrl));
// Reports
router.get('/reports/revenue', ctrl.getRevenueReport.bind(ctrl));
// Products — admin full access (all statuses)
router.get('/products', ctrl.getProducts.bind(ctrl));
router.get('/products/:id', ctrl.getProductById.bind(ctrl));
router.post('/products', (0, upload_middleware_1.uploadMiddleware)('images', 5), productCtrl.create.bind(productCtrl));
router.put('/products/:id', (0, upload_middleware_1.uploadMiddleware)('images', 5), productCtrl.update.bind(productCtrl));
router.patch('/products/:productId', ctrl.patchProduct.bind(ctrl));
router.delete('/products/:id', productCtrl.delete.bind(productCtrl));
// Categories — admin full access (includes inactive)
router.get('/categories', categoryCtrl.getAll.bind(categoryCtrl));
router.post('/categories', categoryCtrl.create.bind(categoryCtrl));
router.put('/categories/:id', categoryCtrl.update.bind(categoryCtrl));
router.delete('/categories/:id', categoryCtrl.delete.bind(categoryCtrl));
// Order Status Lifecycle Management
router.get('/order-statuses', ctrl.getAllOrderStatuses.bind(ctrl));
router.post('/order-statuses', ctrl.createOrderStatus.bind(ctrl));
router.put('/order-statuses/reorder', ctrl.reorderOrderStatuses.bind(ctrl));
router.put('/order-statuses/:id', ctrl.updateOrderStatus.bind(ctrl));
router.delete('/order-statuses/:id', ctrl.deleteOrderStatus.bind(ctrl));
exports.default = router;
//# sourceMappingURL=admin.routes.js.map