import AddShoppingListItemForm from "../forms/AddShoppingListItemForm.component";
function ItemCard({
  children,
  id,
  title,
  quantity,
  expirationDate,
  dateFrozen,
  notes,
  category,
}) {
  return (
    <li id={id}>
      <article>
        <h2>{title}</h2>
        <p>Quantity: {quantity}</p>
        <p>Expiration Date: {expirationDate}</p>
        {dateFrozen && <p>Date Frozen: {dateFrozen}</p>}
        {notes && <p>Notes: {notes}</p>}
        {category && <p>Category: {category}</p>}
        {children && <div>{children}</div>}
        <AddShoppingListItemForm itemId={{ id }} />
      </article>
    </li>
  );
}

export default ItemCard;
