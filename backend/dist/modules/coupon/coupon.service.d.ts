export declare class CouponService {
    validate(code: string, userId: number, subtotal: number): Promise<{
        coupon: any;
        discount: number;
    }>;
    getAll(page?: number, limit?: number): Promise<{
        data: unknown[];
        total: number;
        page: number;
        pages: number;
        limit: number;
    }>;
    getById(id: number): Promise<any>;
    create(data: any): Promise<any>;
    update(id: number, data: any): Promise<any>;
    delete(id: number): Promise<void>;
    private validateDiscountValue;
    calculateDiscount(coupon: any, subtotal: number): number;
}
//# sourceMappingURL=coupon.service.d.ts.map