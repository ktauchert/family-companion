export function safeAppPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return null;
  }
  if (next.includes('://') || next.includes('\\')) {
    return null;
  }
  return next;
}

export function destAfterAuth(
  next: string | null | undefined,
  hasHousehold: boolean,
): string {
  return safeAppPath(next) ?? (hasHousehold ? '/heute' : '/onboarding');
}
