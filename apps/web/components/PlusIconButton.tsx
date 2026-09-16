export function PlusIconButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="icon-btn" aria-label={label} title={label} onClick={onClick}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
      </svg>
    </button>
  );
}
