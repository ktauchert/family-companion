import { describe, expect, it } from 'vitest';
import { googleSignInPath } from './google-sign-in-path';

describe('googleSignInPath', () => {
  it('does not offer Google Sign-In inside Expo Go', () => {
    expect(googleSignInPath({ isExpoGo: true })).toBe('unavailable');
  });

  it('uses native Google Sign-In in a standalone or dev build', () => {
    expect(googleSignInPath({ isExpoGo: false })).toBe('native');
  });
});
