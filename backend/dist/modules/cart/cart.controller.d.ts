import { Request, Response, NextFunction } from 'express';
export declare class CartController {
    private service;
    getCart(req: Request, res: Response, next: NextFunction): Promise<void>;
    addItem(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateItem(req: Request, res: Response, next: NextFunction): Promise<void>;
    removeItem(req: Request, res: Response, next: NextFunction): Promise<void>;
    clearCart(req: Request, res: Response, next: NextFunction): Promise<void>;
    applyCoupon(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=cart.controller.d.ts.map