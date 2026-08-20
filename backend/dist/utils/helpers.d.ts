export declare function generateSlug(text: string): string;
export declare function generateSku(name: string, categoryId: number): string;
export declare function formatPrice(amount: number): string;
/** Cryptographically random, uppercase base36 token — used anywhere a
 * collision against a UNIQUE column (order numbers, SKUs) must be rare
 * enough that a caller-side retry is realistic rather than routine. */
export declare function randomToken(length: number): string;
//# sourceMappingURL=helpers.d.ts.map