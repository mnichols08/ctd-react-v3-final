import ItemCard from "../cards/ItemCard.component";
import EmptyState from "../ui/EmptyState.component";

function InventorySection({
  id,
  title,
  items,
  addToShoppingList,
  updateItemQuantity,
  updateItem,
}) {
  return (
    <section id={id}>
      <h2>{title}</h2>
      {items && items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              handleAddToShoppingList={addToShoppingList}
              handleUpdateItemQuantity={updateItemQuantity}
              handleUpdateItem={updateItem}
            />
          ))}
        </ul>
      ) : (
        <EmptyState title={title.toLowerCase()} />
      )}
    </section>
  );
}

export default InventorySection;
