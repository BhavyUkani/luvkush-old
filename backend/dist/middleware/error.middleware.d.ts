import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number);
}
export declare const notFoundHandler: (req: Request, res: Response, _next: NextFunction) => void;
export declare const errorHandler: (err: Error | AppError | (Error & {
    type?: string;
    status?: number;
}), _req: Request, res: Response, _next: NextFunction) => void;
//# sourceMappingURL=error.middleware.d.ts.map