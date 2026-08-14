import { generateSlug, generateSku, randomToken } from './helpers';

describe('generateSlug', () => {
  it('slugifies a normal product name', () => {
    expect(generateSlug('Amla Hair Oil 200ml')).toBe('amla-hair-oil-200ml');
  });

  it('falls back to a random slug instead of an empty string for non-Latin names', () => {
    // Regression test for LK-M08 — \w strips all Devanagari characters,
    // which used to leave an empty (and therefore broken) product URL.
    const slug = generateSlug('बालों का तेल');
    expect(slug.length).toBeGreaterThan(0);
    expect(slug).toMatch(/^item-/);
  });
});

describe('generateSku', () => {
  it('builds a prefixed SKU containing the category id', () => {
    const sku = generateSku('Herbal Shampoo', 5);
    expect(sku).toMatch(/^LK-HS-5-[0-9A-F]{6}$/);
  });
});

describe('randomToken', () => {
  it('returns a token of the requested length', () => {
    expect(randomToken(8)).toHaveLength(8);
  });

  it('is not deterministic across calls', () => {
    expect(randomToken(12)).not.toBe(randomToken(12));
  });
});
