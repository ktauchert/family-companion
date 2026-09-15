export type MorningCheckInBand = 'low' | 'mid' | 'high';

export type MorningCheckInOption = {
  band: MorningCheckInBand;
  label: string;
  value: number;
};

/** 1 / 3 / 5 — passt zum bestehenden Algo (niedrig ≤2, hoch ≥4). */
export const MOOD_CHECK_IN_OPTIONS: MorningCheckInOption[] = [
  { band: 'low', label: 'Mies', value: 1 },
  { band: 'mid', label: 'Neutral', value: 3 },
  { band: 'high', label: 'Spitze', value: 5 },
];

export const ENERGY_CHECK_IN_OPTIONS: MorningCheckInOption[] = [
  { band: 'low', label: 'Leer', value: 1 },
  { band: 'mid', label: 'Reicht', value: 3 },
  { band: 'high', label: 'Voll', value: 5 },
];

export function checkInValueToBand(value: number): MorningCheckInBand {
  if (value <= 2) {
    return 'low';
  }
  if (value >= 4) {
    return 'high';
  }
  return 'mid';
}

export function checkInBandToValue(
  band: MorningCheckInBand,
  options: MorningCheckInOption[],
): number {
  const match = options.find((option) => option.band === band);
  return match?.value ?? 3;
}

export function moodBandToValue(band: MorningCheckInBand): number {
  return checkInBandToValue(band, MOOD_CHECK_IN_OPTIONS);
}

export function energyBandToValue(band: MorningCheckInBand): number {
  return checkInBandToValue(band, ENERGY_CHECK_IN_OPTIONS);
}

export function moodLabelForValue(value: number): string {
  const band = checkInValueToBand(value);
  return MOOD_CHECK_IN_OPTIONS.find((option) => option.band === band)?.label ?? 'Neutral';
}

export function energyLabelForValue(value: number): string {
  const band = checkInValueToBand(value);
  return ENERGY_CHECK_IN_OPTIONS.find((option) => option.band === band)?.label ?? 'Reicht';
}
