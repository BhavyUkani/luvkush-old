interface ProductFilters {
    page: number;
    limit: number;
    category?: string;
    sort: string;
    order: 'ASC' | 'DESC';
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    inStock?: boolean;
    featured?: boolean;
    userId?: number;
}
export declare class ProductService {
    private readonly ALLOWED_SORT;
    getAdminAll(filters: {
        page: number;
        limit: number;
        search?: string;
        status?: string;
        category?: string;
    }): Promise<{
        stats: {
            total: number;
            active: number;
            inactive: number;
            draft: number;
            archived: number;
        };
        data: unknown[];
        total: number;
        page: number;
        pages: number;
        limit: number;
    }>;
    patch(id: number, data: {
        is_featured?: boolean;
        is_bestseller?: boolean;
        is_new?: boolean;
        status?: string;
        stock_quantity?: number;
    }): Promise<void>;
    getAll(filters: ProductFilters): Promise<{
        data: unknown[];
        total: number;
        page: number;
        pages: number;
        limit: number;
    }>;
    getFeatured(limit: number): Promise<any>;
    getBySlug(slug: string, userId?: number): Promise<any>;
    search(q: string, limit: number): Promise<any>;
    getRelated(productId: number): Promise<any>;
    create(data: any, files: Express.Multer.File[]): Promise<any>;
    update(id: number, data: any, files?: Express.Multer.File[]): Promise<any>;
    updateStatus(id: number, status: string): Promise<void>;
    delete(id: number): Promise<void>;
    private validatePricing;
    getAdminById(id: number): Promise<any>;
    private getById;
    private generateUniqueSlug;
    private processImage;
}
export {};
//# sourceMappingURL=product.service.d.ts.map