import { useState } from "react";
import ShoppingListControl from "../forms/ShoppingListControl.component";
import EditInventoryItemForm from "../forms/EditInventoryItemForm.component";

// The ItemCard component represents an individual inventory item and conditionally renders forms/buttons based on its state and shopping cart status
function ItemCard({
  item,
  handleAddToShoppingList,
  handleUpdateItemQuantity,
  handleUpdateItem,
}) {
  const [isEditing, setIsEditing] = useState(false);

  // Destructure item properties for easier access
  const {
    id,
    ItemName: itemName,
    QtyOnHand: qtyOnHand,
    QtyUnit: qtyUnit,
    ExpiresOn: expiresOn,
    DateFrozen: dateFrozen,
    Notes: notes,
    Category: category,
  } = item;

  const handleSave = (updatedItem) => {
    handleUpdateItem(updatedItem);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Render the item card with conditional buttons/forms based on shopping cart status and restock needs
  return (
    <li id={id}>
      <article>
        {isEditing ? (
          <EditInventoryItemForm
            item={item}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <>
            <h2>{itemName}</h2>
            <p>
              Quantity on Hand: {qtyOnHand}
              {qtyUnit ? ` ${qtyUnit}` : ""}
            </p>
            {expiresOn && <p>Expiration Date: {expiresOn}</p>}
            {dateFrozen && <p>Date Frozen: {dateFrozen}</p>}
            {notes && <p>Notes: {notes}</p>}
            {category && <p>Category: {category}</p>}
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
