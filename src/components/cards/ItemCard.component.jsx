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
import {
  CardContainer,
  CardHeading,
  CardButton,
  CardButtonDanger,
  CardButtonSecondary,
  CardButtonGroup,
  CardDetailsRow,
  CardProperties,
  CardActions,
} from "./ItemCard.styles";

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
      <CardContainer>
        <CardHeading>
          <Link to={`/item/${item.id}`}>{item.ItemName}</Link>
        </CardHeading>
        <CardDetailsRow>
          <CardProperties>
            {variant === "inventory" &&
              fieldsToRender.map(({ key, label }) => (
                <p key={key}>
                  {label}: {formatValue(item[key])}
                </p>
              ))}
          </CardProperties>
          <CardActions>
            {variant === "archived" && (
              <CardButtonSecondary
                onClick={() => unarchiveItem(item.id)}
                aria-label={`Unarchive ${item.ItemName}`}
              >
                Unarchive
              </CardButtonSecondary>
            )}
            {variant === "inventory" && (
              <>
                <CardButton
                  onClick={() => onEdit(item.id)}
                  aria-label={`Edit ${item.ItemName}`}
                >
                  Edit
                </CardButton>
                <CardButtonSecondary
                  onClick={() => archiveItem(item.id)}
                  aria-label={`Archive ${item.ItemName}`}
                >
                  Archive
                </CardButtonSecondary>
              </>
            )}
            {variant !== "shopping" && (
              <>
                <CardButtonDanger
                  onClick={openDeleteConfirm}
                  disabled={item.isDeleting}
                  aria-label={
                    item.isDeleting
                      ? `Deleting ${item.ItemName}`
                      : `Delete ${item.ItemName}`
                  }
                >
                  {item.isDeleting ? "Deleting…" : "Delete"}
                </CardButtonDanger>
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
          </CardActions>
        </CardDetailsRow>
        {variant !== "archived" && (
          <ShoppingListControl item={item} variant={variant} />
        )}
      </CardContainer>
    </li>
  );
}

export default memo(ItemCard);
