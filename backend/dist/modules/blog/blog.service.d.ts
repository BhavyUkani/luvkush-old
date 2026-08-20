export declare class BlogService {
    getAll(page: number, limit: number, tag?: string): Promise<{
        data: unknown[];
        total: number;
        page: number;
        pages: number;
        limit: number;
    }>;
    getBySlug(slug: string): Promise<any>;
    create(data: {
        title: string;
        slug: string;
        content?: string;
        excerpt?: string;
        cover_image?: string;
        tags?: string;
        status?: string;
        reading_time_mins?: number;
    }, authorId: number): Promise<{
        id: any;
    }>;
    update(id: number, data: {
        title?: string;
        content?: string;
        excerpt?: string;
        cover_image?: string;
        tags?: string;
        status?: string;
        reading_time_mins?: number;
    }): Promise<void>;
    delete(id: number): Promise<void>;
}
//# sourceMappingURL=blog.service.d.ts.map