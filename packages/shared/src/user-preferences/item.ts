import type { UserPreferences } from '../types';

export function defaultUserPreferences(userId: string): UserPreferences {
  return {
    userId,
    kaizenNudgesEnabled: true,
  };
}

export type SaveUserPreferencesResult =
  | { ok: true; preferences: UserPreferences }
  | { ok: false; reason: 'not_owner' };

export function prepareSaveUserPreferences(input: {
  actorId: string;
  preferences: UserPreferences;
}): SaveUserPreferencesResult {
  if (input.preferences.userId !== input.actorId) {
    return { ok: false, reason: 'not_owner' };
  }

  return {
    ok: true,
    preferences: {
      userId: input.preferences.userId,
      kaizenNudgesEnabled: input.preferences.kaizenNudgesEnabled,
    },
  };
}

export function userPreferencesErrorMessage(reason: 'not_owner'): string {
  return 'Du kannst nur deine eigenen Einstellungen speichern.';
}

export function isKaizenNudgesEnabled(preferences: UserPreferences | null | undefined): boolean {
  return preferences?.kaizenNudgesEnabled !== false;
}
