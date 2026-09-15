import { describe, expect, it } from 'vitest';
import {
  authErrorDetails,
  emailPasswordReasonMessage,
  firebaseAuthMessage,
  messageFromAuthError,
  parseEmailPassword,
} from './email-password';

describe('parseEmailPassword', () => {
  it('accepts a trimmed email and a long enough password', () => {
    expect(
      parseEmailPassword({ email: ' Sophie@Home.de ', password: 'secret1' }),
    ).toEqual({
      ok: true,
      email: 'sophie@home.de',
      password: 'secret1',
    });
  });

  it('rejects a blank email', () => {
    expect(parseEmailPassword({ email: '  ', password: 'secret1' })).toEqual({
      ok: false,
      reason: 'email_required',
    });
  });

  it('rejects a malformed email', () => {
    expect(parseEmailPassword({ email: 'sophie', password: 'secret1' })).toEqual({
      ok: false,
      reason: 'email_invalid',
    });
  });

  it('rejects a password shorter than six characters', () => {
    expect(
      parseEmailPassword({ email: 'sophie@home.de', password: '12345' }),
    ).toEqual({ ok: false, reason: 'password_too_short' });
  });

  it('rejects a confirm that does not match', () => {
    expect(
      parseEmailPassword({
        email: 'sophie@home.de',
        password: 'secret1',
        confirmPassword: 'secret2',
      }),
    ).toEqual({ ok: false, reason: 'password_mismatch' });
  });

  it('accepts a matching confirm password', () => {
    expect(
      parseEmailPassword({
        email: 'sophie@home.de',
        password: 'secret1',
        confirmPassword: 'secret1',
      }),
    ).toEqual({
      ok: true,
      email: 'sophie@home.de',
      password: 'secret1',
    });
  });
});

describe('emailPasswordReasonMessage', () => {
  it('explains a password mismatch', () => {
    expect(emailPasswordReasonMessage('password_mismatch')).toBe(
      'Die Passwörter stimmen nicht überein.',
    );
  });
});

describe('firebaseAuthMessage', () => {
  it('maps a known Firebase code to German copy', () => {
    expect(firebaseAuthMessage('auth/email-already-in-use')).toBe(
      'Diese E-Mail ist schon registriert. Bitte anmelden.',
    );
  });

  it('explains when email/password is switched off in Firebase', () => {
    expect(firebaseAuthMessage('auth/operation-not-allowed', 'register')).toBe(
      'E-Mail/Passwort ist in Firebase nicht eingeschaltet (Authentication → Sign-in method).',
    );
  });

  it('uses register wording and the code when the error is unknown', () => {
    expect(firebaseAuthMessage('auth/unknown', 'register')).toBe(
      'Registrierung fehlgeschlagen. (auth/unknown)',
    );
  });

  it('uses sign-in wording for an unknown code without a flow', () => {
    expect(firebaseAuthMessage('auth/unknown')).toBe(
      'Anmeldung fehlgeschlagen. (auth/unknown)',
    );
  });

  it('extracts a code from a Firebase error message', () => {
    expect(firebaseAuthMessage('Firebase: Error (auth/wrong-password).')).toBe(
      'E-Mail oder Passwort stimmt nicht.',
    );
  });
});

describe('messageFromAuthError', () => {
  it('reads a Firebase-shaped error object', () => {
    expect(
      messageFromAuthError(
        { code: 'auth/operation-not-allowed', message: 'Firebase: Error (auth/operation-not-allowed).' },
        'register',
      ),
    ).toBe(
      'E-Mail/Passwort ist in Firebase nicht eingeschaltet (Authentication → Sign-in method).',
    );
  });

  it('does not call a register failure a sign-in failure', () => {
    expect(messageFromAuthError(new Error('nope'), 'register')).toBe(
      'Registrierung fehlgeschlagen.',
    );
  });

  it('maps the Identity Toolkit OPERATION_NOT_ALLOWED string', () => {
    expect(messageFromAuthError(new Error('OPERATION_NOT_ALLOWED'), 'register')).toBe(
      'E-Mail/Passwort ist in Firebase nicht eingeschaltet (Authentication → Sign-in method).',
    );
  });

  it('maps native Google DEVELOPER_ERROR', () => {
    expect(
      messageFromAuthError(
        {
          code: '10',
          message:
            'DEVELOPER_ERROR: Follow troubleshooting instructions at https://react-native-google-signin.github.io/docs/troubleshooting',
        },
        'google',
      ),
    ).toContain('SHA-1');
  });

  it('includes unknown google error codes in the message', () => {
    expect(messageFromAuthError({ code: '999', message: 'weird' }, 'google')).toBe(
      'Google-Anmeldung fehlgeschlagen. (999)',
    );
  });
});

describe('authErrorDetails', () => {
  it('formats code and message from native errors', () => {
    expect(
      authErrorDetails({ code: '10', message: 'DEVELOPER_ERROR: troubleshooting' }),
    ).toBe('code=10 · message=DEVELOPER_ERROR: troubleshooting');
  });
});
