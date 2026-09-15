import { describe, expect, it } from 'vitest';
import {
  googleNativeAuthLogLine,
  googleNativeAuthUserMessage,
  resolveGoogleNativeAuthError,
} from './google-native-error';

describe('resolveGoogleNativeAuthError', () => {
  it('maps DEVELOPER_ERROR to GGL-001 with admin contact', () => {
    const info = resolveGoogleNativeAuthError({
      code: '10',
      message: 'DEVELOPER_ERROR: troubleshooting',
    });
    expect(info.code).toBe('GGL-001');
    expect(info.needsAdmin).toBe(true);
    expect(info.userMessage).toContain('GGL-001');
    expect(info.userMessage).not.toContain('SHA-1');
  });

  it('does not ask admin when user cancels', () => {
    const info = resolveGoogleNativeAuthError({ code: '12501', message: 'SIGN_IN_CANCELLED' });
    expect(info.code).toBe('GGL-007');
    expect(info.needsAdmin).toBe(false);
    expect(info.userMessage).toBe('Google-Anmeldung abgebrochen.');
  });

  it('maps missing web client id to GGL-002', () => {
    const info = resolveGoogleNativeAuthError(
      new Error('Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'),
    );
    expect(info.code).toBe('GGL-002');
  });

  it('maps Firebase errors after token to GGL-006', () => {
    const info = resolveGoogleNativeAuthError({
      code: 'auth/operation-not-allowed',
      message: 'Firebase: Error (auth/operation-not-allowed).',
    });
    expect(info.code).toBe('GGL-006');
    expect(info.adminHint).toContain('auth/operation-not-allowed');
  });
});

describe('googleNativeAuthLogLine', () => {
  it('includes support code and sdk details for admins', () => {
    expect(
      googleNativeAuthLogLine({ code: '10', message: 'DEVELOPER_ERROR: x' }),
    ).toContain('GGL-001');
    expect(
      googleNativeAuthLogLine({ code: '10', message: 'DEVELOPER_ERROR: x' }),
    ).toContain('sdk=10');
  });
});

describe('googleNativeAuthUserMessage', () => {
  it('returns the classified user message', () => {
    expect(googleNativeAuthUserMessage({ code: '999', message: 'weird' })).toContain('GGL-099');
  });
});
