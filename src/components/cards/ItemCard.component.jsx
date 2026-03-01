import { useState } from "react";
import AddShoppingListItemForm from "../forms/AddShoppingListItemForm.component";
import EditInventoryItemForm from "../forms/EditInventoryItemForm.component";

// The ItemCard component represents an individual inventory item and conditionally renders forms/buttons based on its state and shopping cart status
function ItemCard({
  item,
  shoppingCart,
  handleAddToShoppingList,
  handleRemoveFromShoppingList,
  handleUpdateItem,
}) {
  const [isEditing, setIsEditing] = useState(false);

  // Destructure item properties for easier access
  const {
    id,
    ItemName: itemName,
    QtyOnHand: qtyOnHand,
    QtyUnit: qtyUnit,
    TargetQty: targetQty,
    NeedRestock: needRestock,
    ExpiresOn: expiresOn,
    DateFrozen: dateFrozen,
    Notes: notes,
    Category: category,
  } = item;
  // Determine if the item is already on the shopping list using the same
  // criteria as MainContainer: NeedRestock is truthy AND TargetQty > QtyOnHand
  const isInShoppingList = needRestock && targetQty > qtyOnHand;

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
            <p>Expiration Date: {expiresOn}</p>
            {dateFrozen && <p>Date Frozen: {dateFrozen}</p>}
            {notes && <p>Notes: {notes}</p>}
            <p>Category: {category}</p>
            {/* If the item is in the shopping cart and a remove handler is provided, show the remove button */}
            {shoppingCart && handleRemoveFromShoppingList ? (
              <button onClick={() => handleRemoveFromShoppingList(id)}>
                Remove from Shopping List
              </button>
            ) : (
              // Else If the item is not in the shopping cart and not already on the shopping list, show the add form
              !shoppingCart &&
              !isInShoppingList &&
              handleAddToShoppingList && (
                <AddShoppingListItemForm
                  itemId={id}
                  handleAddToShoppingList={handleAddToShoppingList}
                />
              )
            )}
            {handleUpdateItem && (
              <button onClick={() => setIsEditing(true)}>Edit</button>
            )}
          </>
        )}
      </article>
    </li>
  );
}

export default ItemCard;
