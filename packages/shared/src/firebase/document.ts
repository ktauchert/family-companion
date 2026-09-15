/** Firestore setDoc rejects `undefined` field values with invalid-argument. */
export function firestoreDocumentPayload<T>(value: T): T {
  if (value === undefined || value === null) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => firestoreDocumentPayload(item)) as T;
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      if (entry !== undefined) {
        out[key] = firestoreDocumentPayload(entry);
      }
    }
    return out as T;
  }
  return value;
}
