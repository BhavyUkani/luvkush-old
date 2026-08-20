export declare class HairSolutionAdminService {
    getAll(filters: {
        type?: 'wig' | 'patch';
        page: number;
        limit: number;
        search?: string;
        status?: string;
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
    getById(id: number): Promise<any>;
    syncVariants(productId: number, sizeInfo: string | null): Promise<void>;
    create(data: any): Promise<any>;
    update(id: number, data: any): Promise<any>;
    updateImages(id: number, primaryImage: string, imagesJson: string): Promise<any>;
    delete(id: number): Promise<void>;
}
//# sourceMappingURL=hair-solution-admin.service.d.ts.map