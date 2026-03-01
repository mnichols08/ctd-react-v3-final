import ItemCard from "../cards/ItemCard.component";
import EmptyState from "../ui/EmptyState.component";

function InventorySection({
  id,
  title,
  items,
  shoppingCart = false,
  addToShoppingList,
  removeFromShoppingList,
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
              shoppingCart={shoppingCart}
              handleAddToShoppingList={addToShoppingList}
              handleRemoveFromShoppingList={removeFromShoppingList}
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
