import type { HeuteAreaSummary } from '@family-companion/shared';
import { NavAreaIcon } from '../icons';
import Link from 'next/link';

export function AreaSummaryCards({
  summaries,
}: {
  summaries: HeuteAreaSummary[];
}) {
  return (
    <section className="heute-summary-grid" aria-label="Bereiche">
      {summaries.map((summary) => (
        <Link key={summary.area} href={summary.webPath} className="card heute-summary-card">
          <span className="heute-summary-head">
            <NavAreaIcon icon={summary.area} size={18} title={summary.title} />
            <strong>{summary.title}</strong>
          </span>
          <span className="muted small">{summary.line}</span>
        </Link>
      ))}
    </section>
  );
}
