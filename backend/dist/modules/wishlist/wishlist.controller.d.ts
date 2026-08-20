import { Request, Response, NextFunction } from 'express';
export declare class WishlistController {
    private service;
    getWishlist(req: Request, res: Response, next: NextFunction): Promise<void>;
    toggle(req: Request, res: Response, next: NextFunction): Promise<void>;
    remove(req: Request, res: Response, next: NextFunction): Promise<void>;
    clear(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=wishlist.controller.d.ts.map