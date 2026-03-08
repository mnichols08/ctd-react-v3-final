import { memo, useState } from "react";
import FieldSelector from "../../cards/FieldSelector.component";

function NavMenu({
  visibleFields,
  onToggleField,
  onResetFields,
  archivedItemsExist,
}) {
  const [showFieldSelector, setShowFieldSelector] = useState(false);

  return (
    <nav>
      <menu>
        <li>
          <a href="#add-item">Add Item</a>
        </li>
        <li>
          <a href="#fridge">Fridge</a>
        </li>
        <li>
          <a href="#freezer">Freezer</a>
        </li>
        <li>
          <a href="#pantry">Pantry</a>
        </li>
        <li>
          <a href="#shopping-list">Shopping List</a>
        </li>
        <li>
          <a
            href="#field-selector"
            onClick={() => setShowFieldSelector((prev) => !prev)}
            aria-label="Select visible fields"
            title="Select visible fields"
          >
            Edit Visible Fields
          </a>
        </li>
        {archivedItemsExist && (
          <li>
            <a href="#archived">Archived Items</a>
          </li>
        )}
      </menu>

      {showFieldSelector && (
        <FieldSelector
          visibleFields={visibleFields}
          onToggleField={onToggleField}
          onResetFields={onResetFields}
          onClose={() => setShowFieldSelector(false)}
        />
      )}
    </nav>
  );
}

export default memo(NavMenu);
