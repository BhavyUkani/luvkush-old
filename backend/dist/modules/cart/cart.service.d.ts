export declare class CartService {
    getOrCreate(userId: number): Promise<any>;
    getCart(userId: number): Promise<{
        subtotal: any;
        shipping: number;
        tax: number;
        total: any;
        item_count: any;
        cart_id: any;
        items: any;
    }>;
    addItem(userId: number, productId: number, quantity: number, variantId?: number): Promise<{
        subtotal: any;
        shipping: number;
        tax: number;
        total: any;
        item_count: any;
        cart_id: any;
        items: any;
    }>;
    updateItem(userId: number, itemId: number, quantity: number): Promise<{
        subtotal: any;
        shipping: number;
        tax: number;
        total: any;
        item_count: any;
        cart_id: any;
        items: any;
    }>;
    removeItem(userId: number, itemId: number): Promise<{
        subtotal: any;
        shipping: number;
        tax: number;
        total: any;
        item_count: any;
        cart_id: any;
        items: any;
    }>;
    clearCart(userId: number): Promise<void>;
    applyCoupon(userId: number, code: string): Promise<{
        coupon: any;
        discount: number;
    }>;
    private computeSummary;
}
//# sourceMappingURL=cart.service.d.ts.map