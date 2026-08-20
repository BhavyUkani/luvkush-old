import { Request, Response, NextFunction } from 'express';
export declare class ReviewController {
    private service;
    getProductReviews(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRatingSummary(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    markHelpful(req: Request, res: Response, next: NextFunction): Promise<void>;
    adminGetAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=review.controller.d.ts.map