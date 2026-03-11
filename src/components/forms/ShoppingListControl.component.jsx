import { memo, useCallback } from "react";
import { useInventoryActions } from "../../context/InventoryContext";

// Unified shopping-list control for an inventory item.
// Shows an "Add to Shopping List" button when the item isn't on the list,
// and a quantity stepper ([ - ] count [ + ]) when it is.
function ShoppingListControl({ item, variant }) {
  const { addToShoppingList, removeFromShoppingList, updateTargetQty } =
    useInventoryActions();
  const {
    id,
    ItemName: itemName,
    QtyOnHand: qtyOnHand,
    TargetQty: targetQty,
    NeedRestock: needRestock,
  } = item;

  // An item is considered "in the shopping list" if it needs restocking and the target quantity is greater than the quantity on hand.
  const isInShoppingList = needRestock && targetQty > qtyOnHand;

  const handleAdd = useCallback(() => {
    addToShoppingList?.(id, 1);
  }, [addToShoppingList, id]);

  const handleDecrement = useCallback(() => {
    updateTargetQty(id, targetQty - 1);
  }, [updateTargetQty, id, targetQty]);

  const handleIncrement = useCallback(() => {
    updateTargetQty(id, targetQty + 1);
  }, [updateTargetQty, id, targetQty]);

  const isShoppingVariant = variant === "shopping";

  const componentHeading = isShoppingVariant ? (
    <p>Qty on Hand: {qtyOnHand}</p>
  ) : (
    <h3>Shopping List Controls</h3>
  );

  // Case 1: Shopping List section — show stepper
  if (isInShoppingList && isShoppingVariant) {
    const willRemove = targetQty - 1 <= qtyOnHand;
    return (
      <div>
        {componentHeading}
        <span>Qty in Cart: </span>
        <button
          onClick={handleDecrement}
          aria-label={`${willRemove ? "Remove from" : "Decrease quantity for"} ${itemName}`}
        >
          {willRemove ? "Remove" : "-"}
        </button>{" "}
        {Math.ceil(targetQty - qtyOnHand)}{" "}
        <button
          onClick={handleIncrement}
          aria-label={`Increase quantity for ${itemName}`}
        >
          +
        </button>
      </div>
    );
  }

  // Case 2: Inventory section — item is on shopping list → show "Remove" button
  if (isInShoppingList) {
    return (
      <div>
        {componentHeading}
        <button
          onClick={() => removeFromShoppingList(id)}
          aria-label={`Remove ${itemName} from shopping list`}
        >
          Remove from Shopping List
        </button>
      </div>
    );
  }

  // Case 3: Not on shopping list → show "Add" button
  return (
    <div>
      {componentHeading}
      <button onClick={handleAdd}>Add to Shopping List</button>
    </div>
  );
}

export default memo(ShoppingListControl);
