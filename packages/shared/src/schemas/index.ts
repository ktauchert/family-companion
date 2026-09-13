import { z } from 'zod';

export const ShoppingCategorySchema = z.enum([
  'supermarket',
  'drugstore',
  'pharmacy',
  'clothing',
  'other',
]);

export const MorningCheckInInputSchema = z.object({
  mood: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5),
  date: z.string().date(),
});

export const AiSummaryResponseSchema = z.object({
  summary: z.string().describe('Synthetisierte Zusammenfassung des Tages'),
  suggestedShoppingItems: z
    .array(z.string())
    .describe('Automatisch abgeleitete Einkäufe'),
  urgentTodos: z
    .array(z.string())
    .describe('Priorisierte Aufgaben für heute'),
  postponeSuggestions: z
    .array(z.string())
    .describe('Was bei niedriger Energie warten kann'),
});

export type MorningCheckInInput = z.infer<typeof MorningCheckInInputSchema>;
export type AiSummaryResponse = z.infer<typeof AiSummaryResponseSchema>;
