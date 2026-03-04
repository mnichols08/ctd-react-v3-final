// Unified shopping-list control for an inventory item.
// Shows an "Add to Shopping List" button when the item isn't on the list,
// and a quantity stepper ([ - ] count [ + ]) when it is.
function ShoppingListControl({
  item,
  handleAddToShoppingList,
  handleRemoveFromShoppingList,
  handleUpdateItemQuantity,
}) {
  const {
    id,
    ItemName: itemName,
    QtyOnHand: qtyOnHand,
    TargetQty: targetQty,
    NeedRestock: needRestock,
  } = item;

  const isInShoppingList = needRestock && targetQty > qtyOnHand;

  const handleAdd = () => {
    if (typeof handleAddToShoppingList !== "function") return;
    handleAddToShoppingList({ itemId: id, quantity: 1 });
  };

  const handleDecrement = () => {
    if (typeof handleUpdateItemQuantity !== "function") return;
    handleUpdateItemQuantity(id, targetQty - 1);
  };

  const handleIncrement = () => {
    if (typeof handleUpdateItemQuantity !== "function") return;
    handleUpdateItemQuantity(id, targetQty + 1);
  };
  const componentHeading = handleAddToShoppingList ? (
    <h3>Shopping List Controls</h3>
  ) : (
    <p>Qty on Hand: {qtyOnHand}</p>
  );
  // Case 1: On shopping list AND has stepper handler → render stepper
  if (isInShoppingList && typeof handleUpdateItemQuantity === "function") {
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

  // Case 2: Already on shopping list but no stepper (location sections) → hide the button
  if (isInShoppingList) {
    return (
      <div>
        {componentHeading}
        <button
          onClick={() => handleRemoveFromShoppingList(id)}
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

export default ShoppingListControl;
