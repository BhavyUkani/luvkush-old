import { Request, Response, NextFunction } from 'express';
export declare class HairSolutionController {
    private service;
    getFeatured(_req: Request, res: Response, next: NextFunction): Promise<void>;
    getWigs(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPatches(_req: Request, res: Response, next: NextFunction): Promise<void>;
    getBySlug(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=hair-solution.controller.d.ts.map