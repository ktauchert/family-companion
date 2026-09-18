export type ProTeaser = {
  id: 'ki-plan' | 'per-member-habits' | 'smart-shopping';
  title: string;
  line: string;
};

export const PRO_TEASERS: ProTeaser[] = [
  {
    id: 'ki-plan',
    title: 'KI-Tagesplan',
    line: 'Feinere Reihenfolge und Umverteilung nach Stimmung und Energie.',
  },
  {
    id: 'per-member-habits',
    title: 'Per-Member-Habits',
    line: 'Jede Person hakte denselben Termin oder Todo selbst ab.',
  },
  {
    id: 'smart-shopping',
    title: 'Smart Shopping',
    line: 'Freitext und Muster aus Listen — z. B. „Wir kochen Lasagne.“',
  },
];
