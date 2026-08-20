import { Request, Response, NextFunction } from 'express';
export declare class OrderController {
    private service;
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMyOrders(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMyOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMyOrderStatusHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
    getByOrderNumber(req: Request, res: Response, next: NextFunction): Promise<void>;
    cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    abortPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStatusCounts(req: Request, res: Response, next: NextFunction): Promise<void>;
    adminGetAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    adminGetOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStatusHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateTracking(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCourierRates(req: Request, res: Response, next: NextFunction): Promise<void>;
    getShipmentTracking(req: Request, res: Response, next: NextFunction): Promise<void>;
    bookShipment(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllStatuses(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateStatusHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteStatusHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=order.controller.d.ts.map