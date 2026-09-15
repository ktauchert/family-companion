import { describe, expect, it } from 'vitest';
import {
  checkInValueToBand,
  energyBandToValue,
  moodBandToValue,
} from './scale';

describe('morning check-in scale', () => {
  it('maps stored values to three bands', () => {
    expect(checkInValueToBand(1)).toBe('low');
    expect(checkInValueToBand(2)).toBe('low');
    expect(checkInValueToBand(3)).toBe('mid');
    expect(checkInValueToBand(4)).toBe('high');
    expect(checkInValueToBand(5)).toBe('high');
  });

  it('maps bands to algo-friendly values', () => {
    expect(moodBandToValue('low')).toBe(1);
    expect(moodBandToValue('mid')).toBe(3);
    expect(moodBandToValue('high')).toBe(5);
    expect(energyBandToValue('high')).toBe(5);
  });
});
