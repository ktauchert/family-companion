import type { Household, PrioritizationSuggestion } from '@family-companion/shared';
import { householdMemberLabel } from '@family-companion/shared';

export function SuggestionCard({
  suggestion,
  household,
  busy,
  onConfirm,
  onDismiss,
}: {
  suggestion: PrioritizationSuggestion;
  household: Household;
  busy: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  return (
    <article className="card stack suggestion-card">
      <p>{suggestion.message}</p>
      {suggestion.suggestedAssignee ? (
        <p className="muted small">
          Vorschlag:{' '}
          {householdMemberLabel(household.memberEmails?.[suggestion.suggestedAssignee] ?? null)}
        </p>
      ) : null}
      <div className="row-actions">
        <button className="btn" type="button" disabled={busy} onClick={onConfirm}>
          Bestätigen
        </button>
        <button className="btn ghost" type="button" disabled={busy} onClick={onDismiss}>
          Ablehnen
        </button>
      </div>
    </article>
  );
}
