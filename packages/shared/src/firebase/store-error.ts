export function storeErrorCode(err: unknown): string | null {
  if (
    err &&
    typeof err === 'object' &&
    'code' in err &&
    typeof (err as { code: unknown }).code === 'string'
  ) {
    return (err as { code: string }).code.replace(/^firestore\//, '');
  }
  if (err instanceof Error) {
    const match = err.message.match(/permission-denied|unavailable|not-found/i);
    return match?.[0]?.toLowerCase() ?? null;
  }
  return null;
}

export function messageFromStoreError(err: unknown, fallback: string): string {
  const code = storeErrorCode(err);
  if (code === 'permission-denied') {
    return `${fallback} Firebase hat die Anfrage abgelehnt (E-Mail auf der Liste? Rules veröffentlicht?).`;
  }
  if (code) {
    return `${fallback} (${code})`;
  }
  return fallback;
}
