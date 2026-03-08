import { memo } from "react";
import useToggle from "../../hooks/useToggle";
import ItemCard from "../cards/ItemCard.component";
import EmptyState from "../ui/EmptyState.component";

function InventorySection({
  id,
  title,
  items,
  addToShoppingList,
  removeFromShoppingList,
  updateTargetQty,
  updateItem,
  visibleFields,
  archiveItem,
  unarchiveItem,
  deleteItem,
}) {
  // State to track whether the section is collapsed or expanded
  const isArchivedSection = id === "archived";
  const [isCollapsed, toggleCollapsed] = useToggle(isArchivedSection);

  // Calculate the item count for display
  const itemCount = items ? items.length : 0;
  // Generate a unique ID for the collapsible content region
  const contentId = `${id}-content`;

  return (
    <section id={id}>
      <h2 id={`${id}-heading`} onClick={toggleCollapsed}>
        {title} ({itemCount}){" "}
      </h2>{" "}
      {itemCount > 0 && (
        <button
          aria-expanded={!isCollapsed}
          aria-controls={contentId}
          onClick={toggleCollapsed}
        >
          {isCollapsed ? "Show Collapsed" : "Collapse"}
        </button>
      )}
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
                  addToShoppingList={addToShoppingList}
                  removeFromShoppingList={removeFromShoppingList}
                  updateTargetQty={updateTargetQty}
                  handleUpdateItem={updateItem}
                  visibleFields={visibleFields}
                  handleArchiveItem={archiveItem}
                  handleUnarchiveItem={unarchiveItem}
                  handleDeleteItem={deleteItem}
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

export default memo(InventorySection);
