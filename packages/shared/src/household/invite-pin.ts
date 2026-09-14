export const INVITE_PIN_LENGTH = 6;

export type InvitePinResult =
  | { ok: true; pin: string }
  | { ok: false; reason: 'pin_required' | 'pin_invalid' };

function defaultRandomBytes(size: number): Uint8Array {
  const bytes = new Uint8Array(size);
  const webCrypto = globalThis.crypto;
  if (webCrypto && typeof webCrypto.getRandomValues === 'function') {
    webCrypto.getRandomValues(bytes);
    return bytes;
  }
  for (let i = 0; i < size; i += 1) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

export function newInvitePin(
  randomBytes: (size: number) => Uint8Array = defaultRandomBytes,
): string {
  const bytes = randomBytes(4);
  const value =
    ((bytes[0] ?? 0) * 2 ** 24 +
      (bytes[1] ?? 0) * 2 ** 16 +
      (bytes[2] ?? 0) * 2 ** 8 +
      (bytes[3] ?? 0)) %
    10 ** INVITE_PIN_LENGTH;
  return String(value).padStart(INVITE_PIN_LENGTH, '0');
}

export function parseInvitePin(raw: string): InvitePinResult {
  const pin = raw.replace(/\s/g, '');
  if (pin.length === 0) {
    return { ok: false, reason: 'pin_required' };
  }
  if (!new RegExp(`^\\d{${INVITE_PIN_LENGTH}}$`).test(pin)) {
    return { ok: false, reason: 'pin_invalid' };
  }
  return { ok: true, pin };
}

export function invitePinReasonMessage(
  reason: Exclude<InvitePinResult, { ok: true }>['reason'],
): string {
  switch (reason) {
    case 'pin_required':
      return 'Bitte den 6-stelligen PIN eingeben.';
    case 'pin_invalid':
      return 'Der PIN muss aus genau 6 Ziffern bestehen.';
  }
}
