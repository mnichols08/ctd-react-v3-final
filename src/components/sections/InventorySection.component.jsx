import { useState } from "react";

import ItemCard from "../cards/ItemCard.component";
import EmptyState from "../ui/EmptyState.component";

function InventorySection({
  id,
  title,
  items,
  addToShoppingList,
  updateItemQuantity,
  updateItem,
  visibleFields,
}) {
  // State to track whether the section is collapsed or expanded
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Calculate the item count for display
  const itemCount = items ? items.length : 0;
  // Generate a unique ID for the collapsible content region
  const contentId = `${id}-content`;

  // Handler for toggling the collapsed state
  const handleClick = (e) => {
    e.preventDefault();
    setIsCollapsed(!isCollapsed);
  };
  return (
    <section id={id}>
      <h2
        id={`${id}-heading`}
        onClick={handleClick}
        style={{
          cursor: itemCount > 0 ? "pointer" : "text",
          display: "inline-block",
        }}
      >
        {title} ({itemCount}){" "}
      </h2>{" "}
      <a
        href=""
        aria-expanded={!isCollapsed}
        aria-controls={contentId}
        onClick={handleClick}
      >
        {itemCount > 0 && (isCollapsed ? "Show Collapsed" : "Collapse")}
      </a>
      <div id={contentId} role="region" aria-labelledby={`${id}-heading`}>
        {itemCount > 0 && items && items.length > 0 ? (
          isCollapsed ? (
            <p>Collapsed</p>
          ) : (
            <ul>
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  handleAddToShoppingList={addToShoppingList}
                  handleUpdateItemQuantity={updateItemQuantity}
                  handleUpdateItem={updateItem}
                  visibleFields={visibleFields}
                />
              ))}
            </ul>
          )
        ) : (
          <EmptyState title={title.toLowerCase()} />
        )}
      </div>
    </section>
  );
}

export default InventorySection;
