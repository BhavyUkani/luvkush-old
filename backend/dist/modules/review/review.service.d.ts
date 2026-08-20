export declare class ReviewService {
    getProductReviews(productId: number, page?: number, limit?: number): Promise<{
        data: unknown[];
        total: number;
        page: number;
        pages: number;
        limit: number;
    }>;
    getRatingSummary(productId: number): Promise<any>;
    create(userId: number, data: {
        product_id: number;
        rating: number;
        title?: string;
        body: string;
    }): Promise<any>;
    markHelpful(reviewId: number, userId: number): Promise<void>;
    adminGetAll(page?: number, limit?: number, status?: string): Promise<{
        data: unknown[];
        total: number;
        page: number;
        pages: number;
        limit: number;
    }>;
    updateStatus(id: number, status: string): Promise<void>;
    delete(id: number): Promise<void>;
    private updateProductRating;
}
//# sourceMappingURL=review.service.d.ts.map