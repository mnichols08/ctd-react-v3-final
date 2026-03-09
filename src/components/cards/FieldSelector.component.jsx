import { memo, useEffect, useRef } from "react";
import {
  useInventoryUI,
  useInventoryActions,
} from "../../context/InventoryContext";
import { ALL_FIELDS } from "../../data/fieldConfig";

function FieldSelector({ onClose }) {
  const dialogRef = useRef(null);
  const { visibleFields } = useInventoryUI();
  const { toggleField, resetFields } = useInventoryActions();

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
          ×
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
                onChange={() => toggleField(key)}
              />
              {label}
            </label>
          </li>
        ))}
      </ul>

      <div>
        <button onClick={resetFields}>Reset to Defaults</button>
        <button onClick={onClose}>Done</button>
      </div>
    </dialog>
  );
}

export default memo(FieldSelector);
