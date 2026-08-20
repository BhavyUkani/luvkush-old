export declare class AdminService {
    getDashboardStats(): Promise<{
        orders: any;
        revenue: any;
        customers: any;
        products: any;
        profit: any;
        recentOrders: any;
        topProducts: any;
        revenueChart: any;
    }>;
    private computeDashboardStats;
    getCustomers(page?: number, limit?: number, search?: string): Promise<{
        data: unknown[];
        total: number;
        page: number;
        pages: number;
        limit: number;
    }>;
    getInventoryAlerts(): Promise<{
        out_of_stock: any;
        low_stock: any;
    }>;
    updateInventory(productId: number, quantity: number): Promise<void>;
    getRevenueReport(period: 'daily' | 'weekly' | 'monthly'): Promise<any>;
}
//# sourceMappingURL=admin.service.d.ts.map