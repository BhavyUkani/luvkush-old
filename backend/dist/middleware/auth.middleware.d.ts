import { Request, Response, NextFunction } from 'express';
export interface JwtPayload {
    userId: number;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export declare const authenticate: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...roles: string[]) => (req: Request, _res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map