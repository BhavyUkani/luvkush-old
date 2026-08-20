import { Request, Response, NextFunction } from 'express';
export declare class UserController {
    private service;
    getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    changePassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAddresses(req: Request, res: Response, next: NextFunction): Promise<void>;
    addAddress(req: Request, res: Response, next: NextFunction): Promise<void>;
    setDefaultAddress(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateAddress(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteAddress(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=user.controller.d.ts.map