import { useState } from "react";
import ShoppingListControl from "../forms/ShoppingListControl.component";
import EditInventoryItemForm from "../forms/EditInventoryItemForm.component";
import { ALL_FIELDS, DEFAULT_VISIBLE_FIELDS } from "../../data/fieldConfig";

// Helper function to format field values for display (e.g., convert booleans to "Yes"/"No")
function formatValue(key, value) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

// The ItemCard component represents an individual inventory item and conditionally renders forms/buttons based on its state and shopping cart status
function ItemCard({
  item,
  handleAddToShoppingList,
  handleUpdateItemQuantity,
  handleUpdateItem,
  visibleFields = new Set(DEFAULT_VISIBLE_FIELDS),
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

            {fieldsToRender.map(({ key, label }) => (
              <p key={key}>
                {label}: {formatValue(key, item[key])}
              </p>
            ))}

            {handleUpdateItem && (
              <button onClick={() => setIsEditing(true)}>Edit</button>
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
