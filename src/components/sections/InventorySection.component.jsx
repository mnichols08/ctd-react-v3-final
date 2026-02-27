import ItemCard from "../cards/ItemCard.component";
import EmptyState from "../ui/EmptyState.component";

function InventorySection({id, title, items}) {
  return (
      <section id={id}>
        <h2>{title}</h2>
        <ul>
          {items && items.length > 0 ? (
            items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
              />
            ))
          ) : (
            <EmptyState title={title.toLowerCase()} />
          )}
        </ul>
      </section>
  );
}

export default InventorySection;
