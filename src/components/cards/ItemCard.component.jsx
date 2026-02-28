import AddShoppingListItemForm from "../forms/AddShoppingListItemForm.component";
function ItemCard({ item }) {
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


  return (
    <li id={id}>
      <article>
        <h2>{itemName}</h2>
        <p>
          Quantity: {qtyOnHand}
          {qtyUnit ? ` ${qtyUnit}` : ""}
        </p>
        <p>Expiration Date: {expiresOn}</p>
        {dateFrozen && <p>Date Frozen: {dateFrozen}</p>}
        {notes && <p>Notes: {notes}</p>}
        <p>Category: {category}</p>
        <AddShoppingListItemForm itemId={id} />
      </article>
    </li>
  );
}

export default ItemCard;
