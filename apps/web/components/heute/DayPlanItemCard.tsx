import type { DayPlanItem, Household } from '@family-companion/shared';
import {
  calendarAssigneeLabel,
  dayPlanItemMetaLines,
  dayPlanItemTarget,
  dayPlanItemTitle,
  dayPlanItemToggleSupported,
  dayPlanKindStamp,
} from '@family-companion/shared';
import Link from 'next/link';
import {
  DayPlanKindIconGlyph,
  ShoppingCategoryIconGlyph,
} from '../icons';
import { EnergyHintBadge } from './EnergyHintBadge';

/**
 * DayPlanItemCard — mini-card for one prioritized Heute row.
 * Props: item, household, done?, toggling?, onToggleDone?
 */
export function DayPlanItemCard({
  item,
  household,
  done = false,
  toggling = false,
  onToggleDone,
}: {
  item: DayPlanItem;
  household: Household;
  done?: boolean;
  toggling?: boolean;
  onToggleDone?: () => void;
}) {
  const target = dayPlanItemTarget(item);
  const title = dayPlanItemTitle(item);
  const metaLines = dayPlanItemMetaLines(item, {
    assigneeLabel:
      item.kind !== 'shopping' && item.assignedTo && item.assignedTo.length > 0
        ? calendarAssigneeLabel(household, item.assignedTo)
        : undefined,
  });
  const canToggle = dayPlanItemToggleSupported(item) && onToggleDone;

  return (
    <article className={`day-plan-card${done ? ' day-plan-card--done' : ''}`}>
      <Link href={target.webPath} className="day-plan-card-link">
        <span className="day-plan-card-icon" aria-hidden="true">
          {item.kind === 'shopping' && item.shoppingCategory ? (
            <ShoppingCategoryIconGlyph icon={item.shoppingCategory} size={22} />
          ) : (
            <DayPlanKindIconGlyph icon={item.kind} size={22} />
          )}
        </span>
        <span className="day-plan-card-body">
          <span className="stamp">{dayPlanKindStamp(item)}</span>
          <strong className={`day-plan-card-title${done ? ' done' : ''}`}>{title}</strong>
          {metaLines.map((line) => (
            <span className="muted small day-plan-card-meta" key={line}>
              {line}
            </span>
          ))}
          {item.kind !== 'shopping' ? <EnergyHintBadge band={item.energyHint} /> : null}
        </span>
      </Link>
      {canToggle ? (
        <label className="day-plan-card-toggle check-row">
          <input
            type="checkbox"
            checked={done}
            disabled={toggling}
            aria-label={`${title} erledigt`}
            onChange={() => onToggleDone()}
            onClick={(event) => event.stopPropagation()}
          />
          <span className="small muted">Erledigt</span>
        </label>
      ) : null}
    </article>
  );
}
