import type { CalendarEvent, Household } from '@family-companion/shared';
import { eventCardPills } from '@family-companion/shared';
import { DayPlanKindIconGlyph } from '../icons';
import { EnergyHintBadge } from '../heute/EnergyHintBadge';
import { ItemCardPills } from './ItemCardPills';

/**
 * EventCard — compact calendar row for lists and week view.
 * Props: event, household, actorId, done?, onPress?
 */
export function EventCard({
  event,
  household,
  actorId,
  done = false,
  past = false,
  onPress,
}: {
  event: CalendarEvent;
  household: Household;
  actorId: string;
  done?: boolean;
  past?: boolean;
  onPress?: () => void;
}) {
  const pills = eventCardPills(event, { household, actorId });
  const body = (
    <>
      <span className="item-card-icon" aria-hidden="true">
        <DayPlanKindIconGlyph icon="event" size={22} />
      </span>
      <span className="item-card-body">
        {done ? <span className="stamp item-card-status">Erledigt</span> : null}
        <strong className={`item-card-title${done ? ' done' : ''}`}>{event.title}</strong>
        <ItemCardPills pills={pills} />
        <EnergyHintBadge band={event.energyHint ?? 'medium'} />
      </span>
    </>
  );

  return (
    <article className={`item-card${done ? ' item-card--done' : ''}${past ? ' item-card--past' : ''}`}>
      {onPress ? (
        <button type="button" className="item-card-main" onClick={onPress}>
          {body}
        </button>
      ) : (
        <div className="item-card-main">{body}</div>
      )}
    </article>
  );
}
