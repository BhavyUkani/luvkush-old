import { timingSafeEqualStrings } from './payment.service';

describe('timingSafeEqualStrings', () => {
  it('returns true for identical signatures', () => {
    expect(timingSafeEqualStrings('abc123', 'abc123')).toBe(true);
  });

  it('returns false for different signatures', () => {
    expect(timingSafeEqualStrings('abc123', 'abc124')).toBe(false);
  });

  it('returns false (not a thrown length-mismatch error) for different-length input', () => {
    // crypto.timingSafeEqual throws on unequal-length buffers — an attacker
    // supplying a short/malformed signature must get a clean rejection,
    // not a 500 that could itself leak timing information.
    expect(timingSafeEqualStrings('short', 'a-much-longer-signature-value')).toBe(false);
  });
});
