"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
describe('generateSlug', () => {
    it('slugifies a normal product name', () => {
        expect((0, helpers_1.generateSlug)('Amla Hair Oil 200ml')).toBe('amla-hair-oil-200ml');
    });
    it('falls back to a random slug instead of an empty string for non-Latin names', () => {
        // Regression test for LK-M08 — \w strips all Devanagari characters,
        // which used to leave an empty (and therefore broken) product URL.
        const slug = (0, helpers_1.generateSlug)('बालों का तेल');
        expect(slug.length).toBeGreaterThan(0);
        expect(slug).toMatch(/^item-/);
    });
});
describe('generateSku', () => {
    it('builds a prefixed SKU containing the category id', () => {
        const sku = (0, helpers_1.generateSku)('Herbal Shampoo', 5);
        expect(sku).toMatch(/^LK-HS-5-[0-9A-F]{6}$/);
    });
});
describe('randomToken', () => {
    it('returns a token of the requested length', () => {
        expect((0, helpers_1.randomToken)(8)).toHaveLength(8);
    });
    it('is not deterministic across calls', () => {
        expect((0, helpers_1.randomToken)(12)).not.toBe((0, helpers_1.randomToken)(12));
    });
});
//# sourceMappingURL=helpers.spec.js.map