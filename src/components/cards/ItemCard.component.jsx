function ItemCard({
  children,
  title,
  quantity,
  expirationDate,
  dateFrozen,
  notes,
  category,
}) {
  return (
    <li>
      <article>
        <h2>{title}</h2>
        <p>Quantity: {quantity}</p>
        <p>Expiration Date: {expirationDate}</p>
        {dateFrozen && <p>Date Frozen: {dateFrozen}</p>}
        {notes && <p>Notes: {notes}</p>}
        {category && <p>Category: {category}</p>}
        {children && <div>{children}</div>}
      </article>
    </li>
  );
}

export default ItemCard;
