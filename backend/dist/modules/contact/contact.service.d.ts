export declare class ContactService {
    private emailService;
    create(data: {
        name: string;
        email: string;
        phone?: string;
        subject?: string;
        message: string;
        query_type?: string;
    }, ipAddress: string | null, userAgent: string): Promise<void>;
    getAll(page: number, limit: number, status?: string): Promise<{
        data: unknown[];
        total: number;
        page: number;
        pages: number;
        limit: number;
    }>;
    updateStatus(id: number, status: string): Promise<void>;
}
//# sourceMappingURL=contact.service.d.ts.map