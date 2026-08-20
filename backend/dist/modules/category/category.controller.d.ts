import { Request, Response, NextFunction } from 'express';
export declare class CategoryController {
    private service;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getBySlug(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    uploadImage(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=category.controller.d.ts.map