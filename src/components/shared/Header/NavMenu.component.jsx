import { memo, useMemo } from "react";
import { useInventoryData } from "../../../context/InventoryContext";
import useToggle from "../../../hooks/useToggle";
import FieldSelector from "../../cards/FieldSelector.component";

function NavMenu() {
  const { items } = useInventoryData();
  const archivedItemsExist = useMemo(
    () => items.some((item) => item.Status === "archived"),
    [items],
  );
  const [showFieldSelector, toggleFieldSelector, , closeFieldSelector] =
    useToggle(false);

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
          <button
            onClick={toggleFieldSelector}
            aria-label="Select visible fields"
            title="Select visible fields"
          >
            Edit Visible Fields
          </button>
        </li>
        {archivedItemsExist && (
          <li>
            <a href="#archived">Archived Items</a>
          </li>
        )}
      </menu>

      {showFieldSelector && <FieldSelector onClose={closeFieldSelector} />}
    </nav>
  );
}

export default memo(NavMenu);
