import { PRO_TEASERS } from '@family-companion/shared';
import Link from 'next/link';

export function ProTeaserCards({ settingsPath }: { settingsPath: string }) {
  return (
    <section className="stack" aria-label="Family+ Vorschau">
      <div className="pro-teaser-header">
        <h2>Family+</h2>
        <Link className="text-link small" href={settingsPath}>
          Aktivieren
        </Link>
      </div>
      <div className="pro-teaser-grid">
        {PRO_TEASERS.map((teaser) => (
          <article key={teaser.id} className="card pro-teaser-card">
            <div className="pro-teaser-body">
              <div className="pro-teaser-head">
                <strong>{teaser.title}</strong>
                <span className="stamp pro-teaser-stamp">Pro</span>
              </div>
              <hr className="rule" />
              <p className="muted small">{teaser.line}</p>
            </div>
            <div className="pro-teaser-glass" aria-hidden="true" />
          </article>
        ))}
      </div>
    </section>
  );
}
