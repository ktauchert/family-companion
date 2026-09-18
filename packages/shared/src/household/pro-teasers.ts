export type ProTeaser = {
  id: 'ki-plan' | 'pflicht-habits' | 'smart-shopping';
  title: string;
  line: string;
};

export const PRO_TEASERS: ProTeaser[] = [
  {
    id: 'ki-plan',
    title: 'KI-Tagesplan',
    line: 'Briefing und feinere Umverteilung — ergänzt den Free-Algo.',
  },
  {
    id: 'pflicht-habits',
    title: 'Pflicht-Habits & Kaizen',
    line: 'Täglich sichtbar bis erledigt; abends sanfter Ikigai-Nudge.',
  },
  {
    id: 'smart-shopping',
    title: 'Smart Shopping',
    line: 'Freitext und Muster — KI schlägt Liste und Zutaten vor.',
  },
];
