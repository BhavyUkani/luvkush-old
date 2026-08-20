import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    private service;
    register(req: Request, res: Response, next: NextFunction): Promise<void>;
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
    logout(req: Request, res: Response, next: NextFunction): Promise<void>;
    forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMe(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map