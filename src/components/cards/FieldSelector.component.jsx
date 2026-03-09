import { memo, useEffect, useRef } from "react";
import { ALL_FIELDS } from "../../data/fieldConfig";

function FieldSelector({
  visibleFields,
  onToggleField,
  onResetFields,
  onClose,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleClick}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby="field-selector-title"
    >
      <div id="field-selector">
        <h3 id="field-selector-title">Select Visible Fields</h3>
        <button autoFocus onClick={onClose} aria-label="Close field selector">
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
    </dialog>
  );
}

export default memo(FieldSelector);
