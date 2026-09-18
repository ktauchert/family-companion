'use client';

import type { KaizenNudge } from '@family-companion/shared';

export function KaizenNudgeCard({ nudge }: { nudge: KaizenNudge }) {
  return (
    <article className="card stack wide kaizen-nudge-card" aria-live="polite">
      <div className="row-between">
        <h2>Kaizen</h2>
        <span className="stamp">Abend</span>
      </div>
      <hr className="rule" />
      <p>
        <strong>{nudge.habitTitle}</strong> ist heute noch offen.
      </p>
      <p className="muted">{nudge.quote}</p>
    </article>
  );
}
