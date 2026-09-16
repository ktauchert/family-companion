import type { ItemCardPill } from '@family-companion/shared';

export function ItemCardPills({ pills }: { pills: ItemCardPill[] }) {
  return (
    <span className="item-card-pills">
      {pills.map((pill) => (
        <span
          key={pill.key}
          className={`item-card-pill item-card-pill--${pill.shape}${pill.emphasis ? ' item-card-pill--emphasis' : ''}`}
        >
          {pill.label}
        </span>
      ))}
    </span>
  );
}
