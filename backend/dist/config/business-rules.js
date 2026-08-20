"use strict";
// Storefront pricing constants that used to be scattered as inline literals
// across order.service.ts and cart.service.ts (LK-M25) — kept in one place
// so the checkout total, the cart preview total, and the amount actually
// charged can never quietly drift apart from each other.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAX_RATE = exports.SHIPPING_RULES = void 0;
exports.calculateShippingCost = calculateShippingCost;
exports.calculateTax = calculateTax;
exports.SHIPPING_RULES = {
    // Order value (after discount) at/above which standard shipping is free.
    FREE_THRESHOLD: 999,
    // Standard delivery below the free threshold.
    STANDARD_COST: 99,
    // Express delivery is a flat premium, regardless of order value.
    EXPRESS_COST: 99
};
exports.TAX_RATE = 0.18; // GST
/** @param orderValueAfterDiscount subtotal minus any coupon discount */
function calculateShippingCost(orderValueAfterDiscount, method, freeShippingOverride) {
    if (freeShippingOverride)
        return 0;
    if (method === 'express')
        return exports.SHIPPING_RULES.EXPRESS_COST;
    return orderValueAfterDiscount >= exports.SHIPPING_RULES.FREE_THRESHOLD ? 0 : exports.SHIPPING_RULES.STANDARD_COST;
}
function calculateTax(orderValueAfterDiscount) {
    return Math.round(orderValueAfterDiscount * exports.TAX_RATE);
}
//# sourceMappingURL=business-rules.js.map