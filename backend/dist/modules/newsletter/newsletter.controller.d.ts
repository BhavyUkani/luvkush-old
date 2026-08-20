import { Request, Response, NextFunction } from 'express';
export declare class NewsletterController {
    private service;
    subscribe(req: Request, res: Response, next: NextFunction): Promise<void>;
    unsubscribe(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=newsletter.controller.d.ts.map