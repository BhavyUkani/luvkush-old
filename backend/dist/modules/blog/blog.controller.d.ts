import { Request, Response, NextFunction } from 'express';
export declare class BlogController {
    private service;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getBySlug(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=blog.controller.d.ts.map