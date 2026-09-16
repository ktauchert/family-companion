import type { EnergyBand } from '@family-companion/shared';
import { ENERGY_HINT_VISUAL } from '@family-companion/shared';

export function EnergyHintBadge({ band }: { band: EnergyBand }) {
  const visual = ENERGY_HINT_VISUAL[band];
  return (
    <span
      className={`energy-hint energy-hint--${visual.token}`}
      aria-label={visual.ariaLabel}
      title={visual.ariaLabel}
    >
      <span className="energy-hint-dot" aria-hidden="true" />
      <span className="energy-hint-label">{visual.label}</span>
    </span>
  );
}
