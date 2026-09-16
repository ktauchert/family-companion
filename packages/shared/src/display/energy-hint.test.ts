import { describe, expect, it } from 'vitest';
import { ENERGY_HINT_VISUAL, energyHintAriaLabel, energyHintShortLabel } from './energy-hint';

describe('ENERGY_HINT_VISUAL', () => {
  it('maps each band to a damped token and accessible label', () => {
    expect(ENERGY_HINT_VISUAL.low).toEqual({
      token: 'sage',
      label: 'Niedrig',
      ariaLabel: 'Energie: niedrig',
    });
    expect(ENERGY_HINT_VISUAL.medium.token).toBe('clay');
    expect(ENERGY_HINT_VISUAL.high.token).toBe('rust');
  });

  it('exposes helpers for UI copy', () => {
    expect(energyHintShortLabel('medium')).toBe('Mittel');
    expect(energyHintAriaLabel('high')).toBe('Energie: hoch');
  });
});
