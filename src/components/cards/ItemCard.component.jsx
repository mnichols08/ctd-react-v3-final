import AddShoppingListItemForm from "../forms/AddShoppingListItemForm.component";
function ItemCard({ item }) {
  const {
    id,
    ItemName: itemName,
    Item: legacyItemName,
    QtyOnHand: qtyOnHand,
    Quantity: legacyQuantity,
    QtyUnit: qtyUnit,
    ExpiresOn: expiresOn,
    ExpirationDate: legacyExpirationDate,
    DateFrozen: dateFrozen,
    Notes: notes,
    Category: category,
  } = item;

  const title = itemName || legacyItemName;
  const quantity = qtyOnHand || legacyQuantity;
  const expirationDate = expiresOn || legacyExpirationDate;

  return (
    <li id={id}>
      <article>
        <h2>{title}</h2>
        <p>
          Quantity: {quantity}
          {qtyUnit ? ` ${qtyUnit}` : ""}
        </p>
        <p>Expiration Date: {expirationDate}</p>
        {dateFrozen && <p>Date Frozen: {dateFrozen}</p>}
        {notes && <p>Notes: {notes}</p>}
        <p>Category: {category}</p>
        <AddShoppingListItemForm itemId={id} />
      </article>
    </li>
  );
}

export default ItemCard;
