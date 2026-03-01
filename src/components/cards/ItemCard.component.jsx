import AddShoppingListItemForm from "../forms/AddShoppingListItemForm.component";
// The ItemCard component represents an individual inventory item and conditionally renders forms/buttons based on its state and shopping cart status
function ItemCard({
  item,
  shoppingCart,
  handleAddToShoppingList,
  handleRemoveFromShoppingList,
}) {
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
  // Render the item card with conditional buttons/forms based on shopping cart status and restock needs
  return (
    <li id={id}>
      <article>
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
          // If the item is not in the shopping cart and an add handler is provided, show the add form if restock is needed and target quantity is greater than quantity on hand
          !needRestock &&
          targetQty >= qtyOnHand && (
            <AddShoppingListItemForm
              itemId={id}
              handleAddToShoppingList={handleAddToShoppingList}
            />
          )
        )}
      </article>
    </li>
  );
}

export default ItemCard;
