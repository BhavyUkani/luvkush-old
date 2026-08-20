"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const coupon_service_1 = require("./coupon.service");
describe('CouponService.calculateDiscount', () => {
    const service = new coupon_service_1.CouponService();
    const calc = service.calculateDiscount.bind(service);
    it('caps a fixed discount at the subtotal', () => {
        const coupon = { discount_type: 'fixed', discount_value: 500 };
        expect(calc(coupon, 300)).toBe(300);
    });
    it('never lets a percentage discount exceed the subtotal, even with no max_discount_amount', () => {
        // A 500%-off coupon with no configured cap must not produce a discount
        // larger than the order itself — this is the regression test for LK-H11.
        const coupon = { discount_type: 'percentage', discount_value: 500, max_discount_amount: null };
        expect(calc(coupon, 1000)).toBe(1000);
    });
    it('respects max_discount_amount when it is lower than the percentage would allow', () => {
        const coupon = { discount_type: 'percentage', discount_value: 50, max_discount_amount: 100 };
        expect(calc(coupon, 1000)).toBe(100);
    });
    it('free_shipping coupons never discount the price itself', () => {
        const coupon = { discount_type: 'free_shipping', discount_value: 0 };
        expect(calc(coupon, 1000)).toBe(0);
    });
});
//# sourceMappingURL=coupon.service.spec.js.map