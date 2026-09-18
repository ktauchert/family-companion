import type { ShoppingItem } from '@family-companion/shared';

export function ShoppingListItemRow({
  item,
  busy,
  canDelete,
  onToggle,
  onDelete,
}: {
  item: ShoppingItem;
  busy: boolean;
  canDelete: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="listen-row">
      <label className="listen-row-check check-row">
        <input
          type="checkbox"
          checked={item.checked}
          disabled={busy}
          aria-label={item.name}
          onChange={onToggle}
        />
      </label>
      <span className={`listen-row-name${item.checked ? ' done' : ''}`}>{item.name}</span>
      {canDelete ? (
        <button
          type="button"
          className="icon-btn listen-row-delete"
          disabled={busy}
          aria-label={`${item.name} löschen`}
          title="Löschen"
          onClick={onDelete}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : null}
    </li>
  );
}
