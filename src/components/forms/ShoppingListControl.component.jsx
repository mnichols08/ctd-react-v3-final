// Unified shopping-list control for an inventory item.
// Shows an "Add to Shopping List" button when the item isn't on the list,
// and a quantity stepper ([ - ] count [ + ]) when it is.
function ShoppingListControl({
  item,
  handleAddToShoppingList,
  handleUpdateItemQuantity,
  isRenderedInShoppingCart,
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
  const componentHeading = isRenderedInShoppingCart && (
    <h3>Shopping List Controls</h3>
  );
  if (isInShoppingList) {
    const willRemove = targetQty - 1 <= qtyOnHand;
    return (
      <div>
        {componentHeading}
        <button
          onClick={handleDecrement}
          aria-label={`${willRemove ? "Remove from" : "Decrease quantity for"} ${itemName}`}
        >
          {willRemove ? "Remove" : "-"}
        </button>{" "}
        {targetQty}{" "}
        <button
          onClick={handleIncrement}
          aria-label={`Increase quantity for ${itemName}`}
        >
          +
        </button>
      </div>
    );
  }

  return (
    <div>
      {componentHeading}
      <button onClick={handleAdd}>Add to Shopping List</button>
    </div>
  );
}

export default ShoppingListControl;
