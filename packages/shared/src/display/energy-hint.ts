import type { EnergyBand } from '../types';

export type EnergyHintVisualToken = 'sage' | 'clay' | 'rust';

export type EnergyHintVisual = {
  token: EnergyHintVisualToken;
  label: string;
  ariaLabel: string;
};

/** Damped traffic-light tokens for Heute cards — see docs/design/ui.md. */
export const ENERGY_HINT_VISUAL: Record<EnergyBand, EnergyHintVisual> = {
  low: {
    token: 'sage',
    label: 'Niedrig',
    ariaLabel: 'Energie: niedrig',
  },
  medium: {
    token: 'clay',
    label: 'Mittel',
    ariaLabel: 'Energie: mittel',
  },
  high: {
    token: 'rust',
    label: 'Hoch',
    ariaLabel: 'Energie: hoch',
  },
};

export function energyHintShortLabel(band: EnergyBand): string {
  return ENERGY_HINT_VISUAL[band].label;
}

export function energyHintAriaLabel(band: EnergyBand): string {
  return ENERGY_HINT_VISUAL[band].ariaLabel;
}
