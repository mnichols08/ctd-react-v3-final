import { useState } from "react";
import ShoppingListControl from "../forms/ShoppingListControl.component";
import EditInventoryItemForm from "../forms/EditInventoryItemForm.component";
import { ALL_FIELDS, DEFAULT_VISIBLE_FIELDS } from "../../data/fieldConfig";

// Declares a module level constant for the default visible fields as a Set for efficient lookups
const DEFAULT_VISIBLE_FIELDS_SET = new Set(DEFAULT_VISIBLE_FIELDS);

// Helper function to format field values for display (e.g., convert booleans to "Yes"/"No")
function formatValue(value) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

// The ItemCard component represents an individual inventory item and conditionally renders forms/buttons based on its state and shopping cart status
function ItemCard({
  item,
  handleAddToShoppingList,
  handleUpdateItemQuantity,
  handleUpdateItem,
  visibleFields = DEFAULT_VISIBLE_FIELDS_SET,
  handleArchiveItem,
  handleUnarchiveItem,
}) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (updatedItem) => {
    handleUpdateItem(updatedItem);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
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
            onCancel={handleCancel}
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
                <button onClick={() => setIsEditing(true)}>Edit</button>
                {handleArchiveItem &&
                  item.Status !== "archived" && (
                    <button onClick={() => handleArchiveItem(item.id)}>
                      Archive
                    </button>
                  )}
              </>
            )}

            {(handleAddToShoppingList || handleUpdateItemQuantity) && (
              <ShoppingListControl
                item={item}
                handleAddToShoppingList={handleAddToShoppingList}
                handleUpdateItemQuantity={handleUpdateItemQuantity}
              />
            )}
          </>
        )}
      </article>
    </li>
  );
}

export default ItemCard;
