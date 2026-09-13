import { describe, expect, it } from 'vitest';
import { canAddHouseholdMember } from './can-add-member';

describe('canAddHouseholdMember', () => {
  it('allows a second member on the free plan', () => {
    expect(canAddHouseholdMember('free', 1)).toBe(true);
  });

  it('rejects a third member on the free plan', () => {
    expect(canAddHouseholdMember('free', 2)).toBe(false);
  });

  it('allows more than two members on the pro plan', () => {
    expect(canAddHouseholdMember('pro', 2)).toBe(true);
  });
});
