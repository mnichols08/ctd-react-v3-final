import { memo } from "react";
import { Link } from "react-router-dom";
import {
  useInventoryUI,
  useInventoryActions,
} from "../../context/InventoryContext";
import useToggle from "../../hooks/useToggle";
import ShoppingListControl from "../forms/ShoppingListControl.component";
import ConfirmDialog from "../ui/ConfirmDialog.component";
import { ALL_FIELDS } from "../../data/fieldConfig";

// Helper function to format field values for display (e.g., convert booleans to "Yes"/"No")
function formatValue(value) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

// The ItemCard component represents an individual inventory item and conditionally renders forms/buttons based on its state and shopping cart status
function ItemCard({ item, onEdit, variant }) {
  const { visibleFields } = useInventoryUI();
  const { archiveItem, unarchiveItem, deleteItem } = useInventoryActions();
  const [showDeleteConfirm, , openDeleteConfirm, closeDeleteConfirm] =
    useToggle(false);

  // Build the list of dynamic fields to render (excluding ItemName, which is always the heading)
  const fieldsToRender = ALL_FIELDS.filter(
    ({ key }) =>
      key !== "ItemName" &&
      visibleFields.has(key) &&
      item[key] !== null &&
      item[key] !== undefined &&
      item[key] !== "",
  );

  // Render the item card with conditional buttons/forms based on shopping cart status and restock needs
  return (
    <li id={item.id}>
      <article>
        <h2>
          <Link to={`/item/${item.id}`}>{item.ItemName}</Link>
        </h2>
        {variant === "archived" && (
          <button onClick={() => unarchiveItem(item.id)}>Unarchive</button>
        )}
        {variant === "inventory" && (
          <>
            {fieldsToRender.map(({ key, label }) => (
              <p key={key}>
                {label}: {formatValue(item[key])}
              </p>
            ))}
            <button onClick={() => onEdit(item.id)}>Edit</button>
            <button onClick={() => archiveItem(item.id)}>Archive</button>
          </>
        )}
        {variant !== "shopping" && (
          <>
            <button onClick={openDeleteConfirm} disabled={item.isDeleting}>
              {item.isDeleting ? "Deleting…" : "Delete"}
            </button>
            {showDeleteConfirm && (
              <ConfirmDialog
                message={`Delete "${item.ItemName}"? This cannot be undone.`}
                onConfirm={() => {
                  closeDeleteConfirm();
                  deleteItem(item.id);
                }}
                onCancel={closeDeleteConfirm}
              />
            )}
          </>
        )}
        {variant !== "archived" && (
          <ShoppingListControl item={item} variant={variant} />
        )}
      </article>
    </li>
  );
}

export default memo(ItemCard);
