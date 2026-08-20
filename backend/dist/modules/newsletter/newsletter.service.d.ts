export declare class NewsletterService {
    /** Returns true when a brand-new subscriber row was created (vs. an
     * existing one being reactivated), so the controller can pick 201 vs 200. */
    subscribe(rawEmail: string, name?: string): Promise<boolean>;
    unsubscribe(rawEmail: string, token: string): Promise<void>;
    getAll(page: number, limit: number): Promise<{
        data: unknown[];
        total: number;
        page: number;
        pages: number;
        limit: number;
    }>;
}
//# sourceMappingURL=newsletter.service.d.ts.map