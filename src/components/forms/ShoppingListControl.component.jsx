import { memo, useCallback } from "react";

// Unified shopping-list control for an inventory item.
// Shows an "Add to Shopping List" button when the item isn't on the list,
// and a quantity stepper ([ - ] count [ + ]) when it is.
function ShoppingListControl({
  item,
  addToShoppingList,
  removeFromShoppingList,
  updateTargetQty,
}) {
  const {
    id,
    ItemName: itemName,
    QtyOnHand: qtyOnHand,
    TargetQty: targetQty,
    NeedRestock: needRestock,
  } = item;

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

  const componentHeading = addToShoppingList ? (
    <h3>Shopping List Controls</h3>
  ) : (
    <p>Qty on Hand: {qtyOnHand}</p>
  );

  // Case 1: On shopping list AND has stepper handler → render stepper
  if (isInShoppingList && updateTargetQty) {
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

  // Case 2: On shopping list but no stepper → "Remove from Shopping List" button or static text
  if (isInShoppingList) {
    return (
      <div>
        {componentHeading}
        {removeFromShoppingList ? (
          <button
            onClick={() => removeFromShoppingList(id)}
            aria-label={`Remove ${itemName} from shopping list`}
          >
            Remove from Shopping List
          </button>
        ) : (
          <p>On Shopping List</p>
        )}
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
