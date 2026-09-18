export const KAIZEN_QUOTES = [
  'Kleine Schritte summieren sich — heute reicht ein Prozent.',
  'Ikigai lebt im Alltag, nicht im Perfektionismus.',
  'Disziplin ist Freundlichkeit zu deinem morgigen Ich.',
  'Kaizen: heute ein bisschen besser als gestern.',
  'Am Ball bleiben heißt: jetzt anfangen, nicht morgen warten.',
] as const;

export function pickKaizenQuote(seed: string): string {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash + seed.charCodeAt(index) * (index + 1)) % KAIZEN_QUOTES.length;
  }
  return KAIZEN_QUOTES[hash] ?? KAIZEN_QUOTES[0];
}
