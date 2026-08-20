import { Request, Response, NextFunction } from 'express';
export declare class PaymentController {
    private service;
    createOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    verify(req: Request, res: Response, next: NextFunction): Promise<void>;
    webhook(req: Request, res: Response, next: NextFunction): Promise<void>;
    refund(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=payment.controller.d.ts.map