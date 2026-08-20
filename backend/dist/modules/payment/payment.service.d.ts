export declare function timingSafeEqualStrings(a: string, b: string): boolean;
export declare class PaymentService {
    private _razorpay;
    private get razorpay();
    /**
     * The amount actually owed for a (possibly partial) payment, computed
     * entirely from server-held data (order_items + the product's configured
     * payment_mode/advance_amount). The client only ever gets to say whether
     * it wants a partial charge, never how much that charge should be.
     */
    private computeRequiredAdvance;
    createRazorpayOrder(orderId: number, userId: number, isPartial: boolean): Promise<{
        razorpay_order_id: string;
        amount: number;
        currency: string;
        order_number: any;
        key_id: string;
    }>;
    verifyAndCapture(data: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        order_id: number;
        user_id: number;
    }): Promise<any>;
    handleWebhook(payload: any, signature: string | undefined, rawBody: Buffer | undefined): Promise<void>;
    initiateRefund(orderId: number, amount: number | undefined, adminUserId?: number | null): Promise<import("razorpay/dist/types/refunds").Refunds.RazorpayRefund>;
}
//# sourceMappingURL=payment.service.d.ts.map