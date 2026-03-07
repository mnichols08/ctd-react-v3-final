import { memo } from "react";
import { ALL_FIELDS } from "../../data/fieldConfig";

function FieldSelector({
  visibleFields,
  onToggleField,
  onResetFields,
  onClose,
}) {
  return (
    <div onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="field-selector-title"
        aria-modal="true"
      >
        <div id="field-selector">
          <h3 id="field-selector-title">Select Visible Fields</h3>
          <button onClick={onClose} aria-label="Close field selector">
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
