export function ModalActionBar({
  mode,
  done = false,
  busy = false,
  canDelete = false,
  primaryLabel,
  deleteLabel,
  primaryType = 'button',
  onToggleDone,
  onPrimary,
  onCancel,
  onDelete,
}: {
  mode: 'view' | 'edit' | 'create';
  done?: boolean;
  busy?: boolean;
  canDelete?: boolean;
  primaryLabel: string;
  deleteLabel: string;
  primaryType?: 'button' | 'submit';
  onToggleDone?: () => void;
  onPrimary?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
}) {
  const showDoneToggle = mode !== 'create' && onToggleDone;
  const showDelete = mode !== 'create' && canDelete && onDelete;

  return (
    <div className="modal-action-bar">
      {showDoneToggle ? (
        <button
          type="button"
          className={`chip modal-done-toggle${done ? ' selected' : ''}`}
          disabled={busy}
          onClick={onToggleDone}
        >
          {done ? 'Erledigt' : 'Als erledigt markieren'}
        </button>
      ) : null}
      <div className={`modal-footer-actions${mode === 'view' ? ' modal-footer-actions--single' : ''}`}>
        {mode !== 'view' && onCancel ? (
          <button type="button" className="btn ghost" disabled={busy} onClick={onCancel}>
            Abbrechen
          </button>
        ) : null}
        <button
          type={primaryType}
          className="btn"
          disabled={busy}
          onClick={mode === 'view' ? onPrimary : primaryType === 'button' ? onPrimary : undefined}
        >
          {primaryLabel}
        </button>
      </div>
      {showDelete ? (
        <button type="button" className="modal-delete-link" disabled={busy} onClick={onDelete}>
          {deleteLabel}
        </button>
      ) : null}
    </div>
  );
}
