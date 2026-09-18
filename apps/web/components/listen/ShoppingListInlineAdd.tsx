import type { ShoppingItem } from '@family-companion/shared';
import { suggestShoppingItemNames } from '@family-companion/shared';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

export function ShoppingListInlineAdd({
  value,
  busy,
  listKey,
  historyItems,
  onChange,
  onConfirm,
  onCancel,
}: {
  value: string;
  busy: boolean;
  listKey: string;
  historyItems: ShoppingItem[];
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const suggestions = useMemo(
    () => suggestShoppingItemNames({ query: value, items: historyItems }),
    [value, historyItems],
  );
  const showSuggestions = focused && suggestions.length > 0;

  useEffect(() => {
    inputRef.current?.focus();
    setActiveIndex(-1);
  }, [listKey]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [value]);

  function selectSuggestion(name: string) {
    onChange(name);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  return (
    <form
      className="listen-inline-add"
      onSubmit={(event) => {
        event.preventDefault();
        if (showSuggestions && activeIndex >= 0 && suggestions[activeIndex]) {
          selectSuggestion(suggestions[activeIndex]!);
          return;
        }
        onConfirm();
      }}
    >
      <div className="listen-inline-add-field">
        <input
          ref={inputRef}
          type="text"
          className="listen-inline-add-input"
          placeholder="Artikel hinzufügen…"
          value={value}
          disabled={busy}
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls={showSuggestions ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            showSuggestions && activeIndex >= 0
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
          onFocus={() => setFocused(true)}
          onBlur={() => {
            window.setTimeout(() => setFocused(false), 120);
          }}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (!showSuggestions) {
              return;
            }
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setActiveIndex((current) => (current + 1) % suggestions.length);
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              setActiveIndex((current) =>
                current <= 0 ? suggestions.length - 1 : current - 1,
              );
            } else if (event.key === 'Escape') {
              setActiveIndex(-1);
            }
          }}
          aria-label="Artikel hinzufügen"
        />
        {showSuggestions ? (
          <ul className="listen-suggestions" id={listboxId} role="listbox">
            {suggestions.map((name, index) => (
              <li key={name} role="presentation">
                <button
                  type="button"
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`listen-suggestion${index === activeIndex ? ' listen-suggestion--active' : ''}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(name)}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <button
        type="submit"
        className="icon-btn listen-inline-add-btn"
        disabled={busy || value.trim().length === 0}
        aria-label="Anlegen"
        title="Anlegen"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path d="m5 12 5 5 10-10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        className="icon-btn listen-inline-add-btn"
        disabled={busy}
        aria-label="Eingabe löschen"
        title="Eingabe löschen"
        onClick={onCancel}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}
