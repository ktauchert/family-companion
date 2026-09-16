import type { Household, MorningCheckIn } from '@family-companion/shared';
import { formatMorningCheckInChip } from '@family-companion/shared';

export function CheckInChip({
  checkIns,
  household,
}: {
  checkIns: MorningCheckIn[];
  household: Household;
}) {
  const label = formatMorningCheckInChip(checkIns, household);
  if (!label) {
    return null;
  }
  return (
    <p className="check-in-chip" aria-label={label}>
      {label}
    </p>
  );
}
