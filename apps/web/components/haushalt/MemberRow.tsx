import { householdMemberLabel } from '@family-companion/shared';
import { ItemCardPills } from '../cards/ItemCardPills';

export function MemberRow({
  member,
  actorId,
  isOwner,
  busy,
  onRemove,
}: {
  member: { userId: string; email: string | null; role: 'owner' | 'member' };
  actorId: string;
  isOwner: boolean;
  busy: boolean;
  onRemove: (memberId: string, label: string) => void;
}) {
  const emailLabel = householdMemberLabel(member.email);
  const isSelf = member.userId === actorId;
  const canKick = isOwner && member.role !== 'owner';
  const canLeave = isSelf && member.role !== 'owner';
  const pills = [
    {
      key: 'role',
      label: member.role === 'owner' ? 'Inhaber' : 'Mitglied',
      shape: 'pill' as const,
      emphasis: member.role === 'owner',
    },
    ...(isSelf
      ? [{ key: 'self', label: 'du', shape: 'tag' as const, emphasis: false }]
      : []),
  ];

  return (
    <li className="member-row">
      <span className="member-row-email serif">{emailLabel}</span>
      <ItemCardPills pills={pills} />
      {canKick ? (
        <button
          className="icon-btn member-row-action"
          type="button"
          disabled={busy}
          aria-label={`${emailLabel} entfernen`}
          onClick={() => onRemove(member.userId, emailLabel)}
        >
          Entfernen
        </button>
      ) : null}
      {canLeave ? (
        <button
          className="icon-btn member-row-action"
          type="button"
          disabled={busy}
          onClick={() => onRemove(member.userId, emailLabel)}
        >
          Austreten
        </button>
      ) : null}
    </li>
  );
}
