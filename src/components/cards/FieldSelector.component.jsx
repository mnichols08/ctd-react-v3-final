import { memo, useEffect, useRef } from "react";
import { ALL_FIELDS } from "../../data/fieldConfig";

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function FieldSelector({
  visibleFields,
  onToggleField,
  onResetFields,
  onClose,
}) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  // Focus the close button on mount and handle Escape / focus-trap
  useEffect(() => {
    closeRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll(FOCUSABLE);
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div onClick={onClose}>
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="field-selector-title"
        aria-modal="true"
      >
        <div id="field-selector">
          <h3 id="field-selector-title">Select Visible Fields</h3>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close field selector"
          >
            x
          </button>
        </div>

        <ul>
          {ALL_FIELDS.map(({ key, label, alwaysVisible }) => (
            <li key={key}>
              <label>
                <input
                  type="checkbox"
                  checked={alwaysVisible || visibleFields.has(key)}
                  disabled={alwaysVisible}
                  onChange={() => onToggleField(key)}
                />
                {label}
              </label>
            </li>
          ))}
        </ul>

        <div>
          <button onClick={onResetFields}>Reset to Defaults</button>
          <button onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

export default memo(FieldSelector);
