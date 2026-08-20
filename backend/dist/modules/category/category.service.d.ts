export declare class CategoryService {
    getAll(includeInactive?: boolean): Promise<any>;
    getBySlug(slug: string): Promise<any>;
    getById(id: number): Promise<any>;
    create(data: {
        name: string;
        description?: string;
        image_url?: string;
        icon?: string;
        parent_id?: number;
        display_order?: number;
        meta_title?: string;
        meta_description?: string;
    }): Promise<any>;
    update(id: number, data: any): Promise<any>;
    delete(id: number): Promise<void>;
    private generateUniqueSlug;
}
//# sourceMappingURL=category.service.d.ts.map