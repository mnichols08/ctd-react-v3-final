import AddShoppingListItemForm from "../forms/AddShoppingListItemForm.component";
function ItemCard({ item }) {
  const {
    id,
    ItemName: itemName,
    QtyOnHand: qtyOnHand,
    QtyUnit: qtyUnit,
    ExpirationDate: expiresOn,
    DateFrozen: dateFrozen,
    Notes: notes,
    Category: category,
  } = item;

  const title = itemName ;
  const quantity = qtyOnHand ;
  const expirationDate = expiresOn;

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
