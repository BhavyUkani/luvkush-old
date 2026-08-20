import { Request, Response, NextFunction } from 'express';
export declare class ContactController {
    private service;
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=contact.controller.d.ts.map