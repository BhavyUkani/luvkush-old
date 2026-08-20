type Action = 'product_created' | 'product_updated' | 'product_deleted' | 'category_created' | 'category_updated' | 'category_deleted' | 'order_status_changed' | 'order_shipment_booked' | 'admin_login';
interface LogParams {
    action: Action;
    userId?: number | null;
    module?: string;
    referenceType?: string;
    referenceId?: number;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
}
export declare function logActivity(params: LogParams): Promise<void>;
export {};
//# sourceMappingURL=activity-logger.d.ts.map