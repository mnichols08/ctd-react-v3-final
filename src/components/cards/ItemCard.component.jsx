import { memo } from "react";
import useToggle from "../../hooks/useToggle";
import ShoppingListControl from "../forms/ShoppingListControl.component";
import EditInventoryItemForm from "../forms/EditInventoryItemForm.component";
import { ALL_FIELDS, DEFAULT_VISIBLE_FIELDS_SET } from "../../data/fieldConfig";

// Helper function to format field values for display (e.g., convert booleans to "Yes"/"No")
function formatValue(value) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

// The ItemCard component represents an individual inventory item and conditionally renders forms/buttons based on its state and shopping cart status
function ItemCard({
  item,
  addToShoppingList,
  removeFromShoppingList,
  updateTargetQty,
  handleUpdateItem,
  visibleFields = DEFAULT_VISIBLE_FIELDS_SET,
  handleArchiveItem,
  handleUnarchiveItem,
  handleDeleteItem,
}) {
  const [isEditing, , openEditor, closeEditor] = useToggle(false);

  const handleSave = (updatedItem) => {
    handleUpdateItem(updatedItem);
    closeEditor();
  };

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
        {isEditing ? (
          <EditInventoryItemForm
            item={item}
            onSave={handleSave}
            onCancel={closeEditor}
          />
        ) : (
          <>
            <h2>{item.ItemName}</h2>
            {handleUnarchiveItem && (
              <button onClick={() => handleUnarchiveItem(item.id)}>
                Unarchive
              </button>
            )}
            {handleUpdateItem && (
              <>
                {fieldsToRender.map(({ key, label }) => (
                  <p key={key}>
                    {label}: {formatValue(item[key])}
                  </p>
                ))}
                <button onClick={openEditor}>Edit</button>
                {handleArchiveItem && item.Status !== "archived" && (
                  <button onClick={() => handleArchiveItem(item.id)}>
                    Archive
                  </button>
                )}
              </>
            )}
            {handleDeleteItem && (
              <button
                onClick={() => handleDeleteItem(item.id)}
                disabled={item.isDeleting}
              >
                {item.isDeleting ? "Deleting…" : "Delete"}
              </button>
            )}
            {(addToShoppingList || updateTargetQty) && (
              <ShoppingListControl
                item={item}
                addToShoppingList={addToShoppingList}
                removeFromShoppingList={removeFromShoppingList}
                updateTargetQty={updateTargetQty}
              />
            )}
          </>
        )}
      </article>
    </li>
  );
}

export default memo(ItemCard);
