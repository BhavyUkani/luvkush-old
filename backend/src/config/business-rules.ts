// Storefront pricing constants that used to be scattered as inline literals
// across order.service.ts and cart.service.ts (LK-M25) — kept in one place
// so the checkout total, the cart preview total, and the amount actually
// charged can never quietly drift apart from each other.

export type ShippingMethod = 'standard' | 'express';

export const SHIPPING_RULES = {
  // Order value (after discount) at/above which standard shipping is free.
  FREE_THRESHOLD: 999,
  // Standard delivery below the free threshold.
  STANDARD_COST: 99,
  // Express delivery is a flat premium, regardless of order value.
  EXPRESS_COST: 99
} as const;

export const TAX_RATE = 0.18; // GST

/** @param orderValueAfterDiscount subtotal minus any coupon discount */
export function calculateShippingCost(
  orderValueAfterDiscount: number,
  method: ShippingMethod,
  freeShippingOverride: boolean
): number {
  if (freeShippingOverride) return 0;
  if (method === 'express') return SHIPPING_RULES.EXPRESS_COST;
  return orderValueAfterDiscount >= SHIPPING_RULES.FREE_THRESHOLD ? 0 : SHIPPING_RULES.STANDARD_COST;
}

export function calculateTax(orderValueAfterDiscount: number): number {
  return Math.round(orderValueAfterDiscount * TAX_RATE);
}
