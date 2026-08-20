interface CreateOrderData {
    shipping_address: Record<string, any>;
    coupon_code?: string;
    notes?: string;
    payment_method: string;
    shipping_method?: string;
}
export declare class OrderService {
    createFromCart(userId: number, data: CreateOrderData): Promise<any>;
    getById(orderId: number, userId?: number): Promise<any>;
    getByOrderNumber(orderNumber: string, userId?: number): Promise<any>;
    getUserOrders(userId: number, page?: number, limit?: number): Promise<{
        data: any[];
        total: number;
        page: number;
        pages: number;
        limit: number;
    }>;
    getStatusCounts(): Promise<Record<string, number>>;
    adminGetAll(page: number | undefined, limit: number | undefined, filters: {
        status?: string;
        payment_status?: string;
        search?: string;
    }): Promise<{
        data: unknown[];
        total: number;
        page: number;
        pages: number;
        limit: number;
    }>;
    updateStatus(orderId: number, status: string, note?: string | null, date?: string | null, changedBy?: number | null): Promise<void>;
    getStatusHistory(orderId: number): Promise<any[]>;
    updateTracking(orderId: number, data: {
        tracking_number: string;
        courier_name?: string;
        tracking_url?: string;
    }): Promise<void>;
    cancelOrder(orderId: number, userId: number, reason: string): Promise<void>;
    abortOnlineOrder(orderId: number, userId: number): Promise<void>;
    releaseAbandonedOnlineOrders(olderThanMinutes: number): Promise<number>;
    private releaseReservedStockAndDeleteOrder;
    syncStatusWithShiprocket(orderId: number, currentDbStatus: string, srStatus: string): Promise<boolean>;
    updateStatusHistory(historyId: number, data: {
        status: string;
        note?: string | null;
        created_at?: string | null;
    }, changedBy?: number | null): Promise<void>;
    deleteStatusHistory(historyId: number, changedBy?: number | null): Promise<void>;
    private generateOrderNumber;
}
export {};
//# sourceMappingURL=order.service.d.ts.map