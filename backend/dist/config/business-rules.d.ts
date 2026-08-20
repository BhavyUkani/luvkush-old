export type ShippingMethod = 'standard' | 'express';
export declare const SHIPPING_RULES: {
    readonly FREE_THRESHOLD: 999;
    readonly STANDARD_COST: 99;
    readonly EXPRESS_COST: 99;
};
export declare const TAX_RATE = 0.18;
/** @param orderValueAfterDiscount subtotal minus any coupon discount */
export declare function calculateShippingCost(orderValueAfterDiscount: number, method: ShippingMethod, freeShippingOverride: boolean): number;
export declare function calculateTax(orderValueAfterDiscount: number): number;
//# sourceMappingURL=business-rules.d.ts.map