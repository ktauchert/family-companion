import { describe, expect, it } from 'vitest';
import { newInvitePin, parseInvitePin } from './invite-pin';

describe('newInvitePin', () => {
  it('turns four bytes into a six-digit pin', () => {
    expect(newInvitePin(() => Uint8Array.from([0, 0, 0, 42]))).toBe('000042');
  });

  it('works when the Web Crypto global is missing', () => {
    const previous = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: undefined,
    });
    try {
      expect(newInvitePin()).toMatch(/^\d{6}$/);
    } finally {
      Object.defineProperty(globalThis, 'crypto', {
        configurable: true,
        value: previous,
      });
    }
  });
});

describe('parseInvitePin', () => {
  it('accepts six digits and strips spaces', () => {
    expect(parseInvitePin(' 12 3456 ')).toEqual({ ok: true, pin: '123456' });
  });

  it('rejects a blank pin', () => {
    expect(parseInvitePin('   ')).toEqual({ ok: false, reason: 'pin_required' });
  });

  it('rejects a pin that is not six digits', () => {
    expect(parseInvitePin('12345')).toEqual({ ok: false, reason: 'pin_invalid' });
    expect(parseInvitePin('12345a')).toEqual({ ok: false, reason: 'pin_invalid' });
  });
});
