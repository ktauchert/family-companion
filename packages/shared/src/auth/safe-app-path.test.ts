import { describe, expect, it } from 'vitest';
import { destAfterAuth, safeAppPath } from './safe-app-path';

describe('safeAppPath', () => {
  it('keeps an in-app join path', () => {
    expect(safeAppPath('/onboarding')).toBe('/onboarding');
  });

  it('rejects an absolute URL', () => {
    expect(safeAppPath('https://evil.example/onboarding')).toBeNull();
  });

  it('rejects a protocol-relative URL', () => {
    expect(safeAppPath('//evil.example/onboarding')).toBeNull();
  });

  it('rejects a path without a leading slash', () => {
    expect(safeAppPath('onboarding')).toBeNull();
  });

  it('rejects empty input', () => {
    expect(safeAppPath(null)).toBeNull();
    expect(safeAppPath('')).toBeNull();
  });
});

describe('destAfterAuth', () => {
  it('prefers a safe next path', () => {
    expect(destAfterAuth('/heute', true)).toBe('/heute');
  });

  it('ignores an unsafe next and uses onboarding without a household', () => {
    expect(destAfterAuth('https://evil.example', false)).toBe('/onboarding');
  });

  it('sends an existing member to heute', () => {
    expect(destAfterAuth(null, true)).toBe('/heute');
  });
});
