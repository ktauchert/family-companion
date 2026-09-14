import { destAfterAuth, safeAppPath } from '@family-companion/shared';
import { households } from './households';

export async function pathAfterAuth(
  uid: string,
  nextParam: string | null | undefined,
): Promise<string> {
  if (safeAppPath(nextParam)) {
    return destAfterAuth(nextParam, false);
  }
  try {
    const existing = await households.householdForUser(uid);
    return destAfterAuth(nextParam, existing !== null);
  } catch {
    return destAfterAuth(nextParam, false);
  }
}
