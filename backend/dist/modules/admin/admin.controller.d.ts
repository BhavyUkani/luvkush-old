import { Request, Response, NextFunction } from 'express';
export declare class AdminController {
    private service;
    private productService;
    getDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCustomers(req: Request, res: Response, next: NextFunction): Promise<void>;
    getInventoryAlerts(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateInventory(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRevenueReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProducts(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProductById(req: Request, res: Response, next: NextFunction): Promise<void>;
    patchProduct(req: Request, res: Response, next: NextFunction): Promise<void>;
    calculateShiprocketRates(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllOrderStatuses(req: Request, res: Response, next: NextFunction): Promise<void>;
    createOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    reorderOrderStatuses(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=admin.controller.d.ts.map