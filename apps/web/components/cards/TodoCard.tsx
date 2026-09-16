import type { Household, TodoItem } from '@family-companion/shared';
import { todoCardPills } from '@family-companion/shared';
import { DayPlanKindIconGlyph } from '../icons';
import { EnergyHintBadge } from '../heute/EnergyHintBadge';
import { ItemCardPills } from './ItemCardPills';

/**
 * TodoCard — compact todo row for lists.
 * Props: todo, household, actorId, done?, toggling?, onPress?, onToggleDone?
 */
export function TodoCard({
  todo,
  household,
  actorId,
  done = false,
  toggling = false,
  onPress,
  onToggleDone,
}: {
  todo: TodoItem;
  household: Household;
  actorId: string;
  done?: boolean;
  toggling?: boolean;
  onPress?: () => void;
  onToggleDone?: () => void;
}) {
  const pills = todoCardPills(todo, { household, actorId });
  const body = (
    <>
      <span className="item-card-icon" aria-hidden="true">
        <DayPlanKindIconGlyph icon="todo" size={22} />
      </span>
      <span className="item-card-body">
        {done ? <span className="stamp item-card-status">Erledigt</span> : null}
        <strong className={`item-card-title${done ? ' done' : ''}`}>{todo.title}</strong>
        <ItemCardPills pills={pills} />
        <EnergyHintBadge band={todo.energyHint ?? 'medium'} />
      </span>
    </>
  );

  return (
    <article className={`item-card${done ? ' item-card--done' : ''}`}>
      {onPress ? (
        <button type="button" className="item-card-main" onClick={onPress}>
          {body}
        </button>
      ) : (
        <div className="item-card-main">{body}</div>
      )}
      {onToggleDone ? (
        <label className="item-card-toggle check-row">
          <input
            type="checkbox"
            checked={done}
            disabled={toggling}
            aria-label={`${todo.title} erledigt`}
            onChange={() => onToggleDone()}
            onClick={(event) => event.stopPropagation()}
          />
        </label>
      ) : null}
    </article>
  );
}
