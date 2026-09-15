export type GoogleNativeAuthErrorCode =
  | 'GGL-001'
  | 'GGL-002'
  | 'GGL-003'
  | 'GGL-004'
  | 'GGL-005'
  | 'GGL-006'
  | 'GGL-007'
  | 'GGL-008'
  | 'GGL-099';

export type GoogleNativeAuthErrorInfo = {
  code: GoogleNativeAuthErrorCode;
  /** Kurztext für Admins — siehe docs/lessons-learned/native-google-expo-android.md */
  adminHint: string;
  /** Endnutzer-Meldung (ohne technische Details) */
  userMessage: string;
  needsAdmin: boolean;
};

const ADMIN_CONTACT =
  'Bitte wende dich an den Admin und nenne den Code';

function sdkCode(err: unknown): string | null {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: unknown }).code;
    if (typeof code === 'string' || typeof code === 'number') {
      return String(code);
    }
  }
  return null;
}

function sdkMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }
  return '';
}

function firebaseAuthCode(err: unknown): string | null {
  const code = sdkCode(err);
  if (code?.startsWith('auth/')) {
    return code;
  }
  const message = sdkMessage(err);
  const fromMessage = message.match(/auth\/[\w.-]+/);
  return fromMessage?.[0] ?? null;
}

function adminMessage(code: GoogleNativeAuthErrorCode): string {
  return `Google-Anmeldung fehlgeschlagen. ${ADMIN_CONTACT} ${code}.`;
}

/** Fehlerklassifikation für natives Google Sign-In (Android Dev-/Store-Build). */
export function resolveGoogleNativeAuthError(err: unknown): GoogleNativeAuthErrorInfo {
  const code = sdkCode(err);
  const message = sdkMessage(err);

  if (code === '12501' || /SIGN_IN_CANCELLED/i.test(message)) {
    return {
      code: 'GGL-007',
      adminHint: 'Nutzer hat den Google-Dialog abgebrochen.',
      userMessage: 'Google-Anmeldung abgebrochen.',
      needsAdmin: false,
    };
  }

  if (
    code === '10' ||
    /DEVELOPER_ERROR/i.test(message) ||
    /DEVELOPER_ERROR/i.test(code ?? '')
  ) {
    return {
      code: 'GGL-001',
      adminHint:
        'Android-Konfiguration: Keystore-SHA-1 in Firebase (Expo Credentials → Android, nicht Build-Fingerprint), Paket com.familycompanion.app, Web-Client-ID.',
      userMessage: adminMessage('GGL-001'),
      needsAdmin: true,
    };
  }

  if (/Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID/i.test(message)) {
    return {
      code: 'GGL-002',
      adminHint:
        'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID fehlt im EAS-Build (Env preview/development pushen, neu bauen).',
      userMessage: adminMessage('GGL-002'),
      needsAdmin: true,
    };
  }

  if (/Google Sign-In lieferte kein idToken/i.test(message)) {
    return {
      code: 'GGL-003',
      adminHint:
        'webClientId muss die Web-Client-ID aus Firebase sein (client_type 3), nicht die Android-Client-ID.',
      userMessage: adminMessage('GGL-003'),
      needsAdmin: true,
    };
  }

  if (/PLAY_SERVICES_NOT_AVAILABLE/i.test(message) || code === '2') {
    return {
      code: 'GGL-004',
      adminHint: 'Google Play Services auf dem Gerät fehlen oder sind veraltet.',
      userMessage:
        'Google Play Services fehlen oder sind veraltet. Bitte im Play Store aktualisieren.',
      needsAdmin: false,
    };
  }

  if (/Kein User nach dem Login/i.test(message)) {
    return {
      code: 'GGL-005',
      adminHint: 'Google-Login ohne Firebase-User — Auth-State prüfen.',
      userMessage: adminMessage('GGL-005'),
      needsAdmin: true,
    };
  }

  const firebaseCode = firebaseAuthCode(err);
  if (firebaseCode === 'auth/network-request-failed') {
    return {
      code: 'GGL-008',
      adminHint: 'Netzwerkfehler beim Firebase-Login nach Google-Token.',
      userMessage: 'Keine Verbindung. Bitte Netz prüfen und erneut versuchen.',
      needsAdmin: false,
    };
  }

  if (firebaseCode) {
    return {
      code: 'GGL-006',
      adminHint: `Firebase nach Google-Token: ${firebaseCode}. Provider/Console prüfen.`,
      userMessage: adminMessage('GGL-006'),
      needsAdmin: true,
    };
  }

  if (code) {
    return {
      code: 'GGL-099',
      adminHint: `Unbekannter nativer Fehler (SDK code=${code}, message=${message || '—'}).`,
      userMessage: adminMessage('GGL-099'),
      needsAdmin: true,
    };
  }

  if (message.trim().length > 0) {
    return {
      code: 'GGL-099',
      adminHint: `Unbekannter Fehler (message=${message}).`,
      userMessage: adminMessage('GGL-099'),
      needsAdmin: true,
    };
  }

  return {
    code: 'GGL-099',
    adminHint: 'Unbekannter Fehler ohne SDK-Code.',
    userMessage: adminMessage('GGL-099'),
    needsAdmin: true,
  };
}

export function googleNativeAuthUserMessage(err: unknown): string {
  return resolveGoogleNativeAuthError(err).userMessage;
}

/** Für Logs / Admin-Support — nicht in der Endnutzer-UI anzeigen. */
export function googleNativeAuthLogLine(err: unknown): string {
  const info = resolveGoogleNativeAuthError(err);
  const code = sdkCode(err);
  const message = sdkMessage(err);
  const parts = [`${info.code}`, info.adminHint];
  if (code) {
    parts.push(`sdk=${code}`);
  }
  if (message) {
    parts.push(`message=${message}`);
  }
  return parts.join(' · ');
}
