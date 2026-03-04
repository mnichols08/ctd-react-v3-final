import { useEffect, useState } from "react";

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
  archiveItem,
  unarchiveItem,
}) {
  // State to track whether the section is collapsed or expanded
  const isArchivedSection = id === "archived" && window.location.hash !== "#archived";
  const [isCollapsed, setIsCollapsed] = useState(isArchivedSection);

  // Calculate the item count for display
  const itemCount = items ? items.length : 0;
  // Generate a unique ID for the collapsible content region
  const contentId = `${id}-content`;

  // Handler for toggling the collapsed state
  const handleClick = (e) => {
    e.preventDefault();
    setIsCollapsed((prevIsCollapsed) => !prevIsCollapsed);
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
                  handleArchiveItem={archiveItem}
                  handleUnarchiveItem={unarchiveItem}
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
