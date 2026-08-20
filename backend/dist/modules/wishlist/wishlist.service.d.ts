export declare class WishlistService {
    getWishlist(userId: number): Promise<any>;
    toggle(userId: number, productId: number): Promise<{
        wishlisted: boolean;
    }>;
    remove(userId: number, productId: number): Promise<void>;
    isWishlisted(userId: number, productId: number): Promise<boolean>;
    clear(userId: number): Promise<void>;
}
//# sourceMappingURL=wishlist.service.d.ts.map