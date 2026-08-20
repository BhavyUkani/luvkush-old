import { Request, Response, NextFunction } from 'express';
export declare class CouponController {
    private service;
    validate(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=coupon.controller.d.ts.map