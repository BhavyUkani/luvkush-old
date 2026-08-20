import { Request, Response, NextFunction } from 'express';
export declare class HairSolutionAdminController {
    private service;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getOne(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    uploadImage(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=hair-solution-admin.controller.d.ts.map