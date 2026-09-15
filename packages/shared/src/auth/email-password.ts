export const MIN_PASSWORD_LENGTH = 6;

import {
  googleNativeAuthLogLine,
  googleNativeAuthUserMessage,
} from './google-native-error';

export type AuthFlow = 'sign-in' | 'register' | 'google';

export type EmailPasswordResult =
  | { ok: true; email: string; password: string }
  | {
      ok: false;
      reason:
        | 'email_required'
        | 'email_invalid'
        | 'password_too_short'
        | 'password_mismatch';
    };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type EmailAddressResult =
  | { ok: true; email: string }
  | { ok: false; reason: 'email_required' | 'email_invalid' };

export function parseEmailAddress(email: string): EmailAddressResult {
  const normalized = email.trim().toLowerCase();
  if (normalized.length === 0) {
    return { ok: false, reason: 'email_required' };
  }
  if (!EMAIL.test(normalized)) {
    return { ok: false, reason: 'email_invalid' };
  }
  return { ok: true, email: normalized };
}

export function parseEmailPassword(input: {
  email: string;
  password: string;
  confirmPassword?: string;
}): EmailPasswordResult {
  const parsedEmail = parseEmailAddress(input.email);
  if (!parsedEmail.ok) {
    return parsedEmail;
  }
  const email = parsedEmail.email;
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, reason: 'password_too_short' };
  }
  if (
    input.confirmPassword !== undefined &&
    input.confirmPassword !== input.password
  ) {
    return { ok: false, reason: 'password_mismatch' };
  }
  return { ok: true, email, password: input.password };
}

const FIREBASE_AUTH_COPY: Record<string, string> = {
  'auth/email-already-in-use':
    'Diese E-Mail ist schon registriert. Bitte anmelden.',
  'auth/invalid-email': 'Bitte eine gültige E-Mail eingeben.',
  'auth/weak-password': 'Passwort zu kurz (mindestens 6 Zeichen).',
  'auth/user-not-found': 'E-Mail oder Passwort stimmt nicht.',
  'auth/wrong-password': 'E-Mail oder Passwort stimmt nicht.',
  'auth/invalid-credential': 'E-Mail oder Passwort stimmt nicht.',
  'auth/invalid-login-credentials': 'E-Mail oder Passwort stimmt nicht.',
  'auth/too-many-requests': 'Zu viele Versuche. Bitte später erneut.',
  'auth/user-disabled': 'Dieses Konto ist deaktiviert.',
  'auth/operation-not-allowed':
    'E-Mail/Passwort ist in Firebase nicht eingeschaltet (Authentication → Sign-in method).',
  'auth/network-request-failed':
    'Keine Verbindung. Bitte Netz prüfen und erneut versuchen.',
  'auth/unauthorized-domain':
    'Diese Seite darf sich bei Firebase nicht anmelden. Bitte localhost nutzen, nicht die WLAN-IP.',
  'auth/invalid-api-key':
    'Firebase-Konfiguration ist ungültig. Bitte .env.local prüfen.',
  'auth/configuration-not-found':
    'Firebase-Konfiguration fehlt. Bitte .env.local prüfen.',
  'auth/popup-closed-by-user': 'Google-Fenster geschlossen.',
  'auth/popup-blocked':
    'Pop-up blockiert. Bitte erlauben und erneut versuchen.',
  'auth/cancelled-popup-request': 'Google-Anmeldung abgebrochen.',
  'auth/account-exists-with-different-credential':
    'Diese E-Mail ist schon mit einer anderen Anmeldung verknüpft.',
  'auth/admin-restricted-operation':
    'Firebase hat diese Anmeldung blockiert. Bitte Provider in der Console prüfen.',
};

const FALLBACK: Record<AuthFlow, string> = {
  'sign-in': 'Anmeldung fehlgeschlagen.',
  register: 'Registrierung fehlgeschlagen.',
  google: 'Google-Anmeldung fehlgeschlagen.',
};

function errorCode(err: unknown): string | null {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: unknown }).code;
    if (typeof code === 'string' || typeof code === 'number') {
      return String(code);
    }
  }
  return null;
}

export function authErrorCode(codeOrMessage: string): string | null {
  const fromSdk = codeOrMessage.match(/auth\/[\w.-]+/);
  if (fromSdk) {
    return fromSdk[0];
  }
  if (/OPERATION_NOT_ALLOWED/i.test(codeOrMessage)) {
    return 'auth/operation-not-allowed';
  }
  return null;
}

export function firebaseAuthMessage(
  codeOrMessage: string,
  flow: AuthFlow = 'sign-in',
): string {
  const code = authErrorCode(codeOrMessage);
  if (code && FIREBASE_AUTH_COPY[code]) {
    return FIREBASE_AUTH_COPY[code];
  }
  if (code) {
    return `${FALLBACK[flow]} (${code})`;
  }
  return FALLBACK[flow];
}

export function messageFromAuthError(
  err: unknown,
  flow: AuthFlow = 'sign-in',
): string {
  if (flow === 'google') {
    return googleNativeAuthUserMessage(err);
  }

  const code = errorCode(err);
  if (code) {
    const fromFirebase = firebaseAuthMessage(code, flow);
    if (fromFirebase !== FALLBACK[flow]) {
      return fromFirebase;
    }
    return fromFirebase;
  }

  if (err instanceof Error) {
    const fromMessage = firebaseAuthMessage(err.message, flow);
    if (fromMessage !== FALLBACK[flow]) {
      return fromMessage;
    }
  }

  return FALLBACK[flow];
}

/** @deprecated Nutzer-UI: googleNativeAuthUserMessage. Logs: googleNativeAuthLogLine. */
export function authErrorDetails(err: unknown): string {
  return googleNativeAuthLogLine(err);
}

export function emailPasswordReasonMessage(
  reason: Exclude<EmailPasswordResult, { ok: true }>['reason'],
): string {
  switch (reason) {
    case 'email_required':
      return 'Bitte eine E-Mail eingeben.';
    case 'email_invalid':
      return 'Bitte eine gültige E-Mail eingeben.';
    case 'password_too_short':
      return 'Passwort zu kurz (mindestens 6 Zeichen).';
    case 'password_mismatch':
      return 'Die Passwörter stimmen nicht überein.';
  }
}
