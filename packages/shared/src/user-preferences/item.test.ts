import { describe, expect, it } from 'vitest';
import {
  defaultUserPreferences,
  prepareSaveUserPreferences,
  userPreferencesErrorMessage,
} from './item';

describe('prepareSaveUserPreferences', () => {
  it('defaults kaizen nudges to enabled', () => {
    expect(defaultUserPreferences('user_julian')).toEqual({
      userId: 'user_julian',
      kaizenNudgesEnabled: true,
    });
  });

  it('rejects updates for another user', () => {
    expect(
      prepareSaveUserPreferences({
        actorId: 'user_julian',
        preferences: defaultUserPreferences('user_sophie'),
      }),
    ).toEqual({ ok: false, reason: 'not_owner' });
  });

  it('saves own kaizen preference', () => {
    expect(
      prepareSaveUserPreferences({
        actorId: 'user_julian',
        preferences: { userId: 'user_julian', kaizenNudgesEnabled: false },
      }),
    ).toEqual({
      ok: true,
      preferences: { userId: 'user_julian', kaizenNudgesEnabled: false },
    });
  });
});

describe('userPreferencesErrorMessage', () => {
  it('maps not_owner', () => {
    expect(userPreferencesErrorMessage('not_owner')).toContain('eigenen');
  });
});
