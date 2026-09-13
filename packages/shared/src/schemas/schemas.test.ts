import { describe, expect, it } from 'vitest';
import { MorningCheckInInputSchema, ShoppingCategorySchema } from './index';

describe('MorningCheckInInputSchema', () => {
  it('accepts a valid morning check-in', () => {
    const result = MorningCheckInInputSchema.safeParse({
      mood: 3,
      energy: 4,
      date: '2026-09-13',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a mood outside 1–5', () => {
    const result = MorningCheckInInputSchema.safeParse({
      mood: 0,
      energy: 3,
      date: '2026-09-13',
    });

    expect(result.success).toBe(false);
  });
});

describe('ShoppingCategorySchema', () => {
  it('accepts a known shopping category', () => {
    const result = ShoppingCategorySchema.safeParse('supermarket');

    expect(result.success).toBe(true);
  });

  it('rejects an unknown shopping category', () => {
    const result = ShoppingCategorySchema.safeParse('hardware');

    expect(result.success).toBe(false);
  });
});
