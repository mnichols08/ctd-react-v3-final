import { memo, useCallback, useState } from "react";
import useToggle from "../../hooks/useToggle";
import ItemCard from "../cards/ItemCard.component";
import EditDialog from "../ui/EditDialog.component";
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

  // Only one item can be edited at a time (opens in a dialog)
  const [editingItemId, setEditingItemId] = useState(null);
  const editingItem = editingItemId
    ? (items?.find((i) => i.id === editingItemId) ?? null)
    : null;
  const closeEditor = useCallback(() => setEditingItemId(null), []);
  const handleEditSave = useCallback(
    (updatedItem) => {
      updateItem(updatedItem);
      setEditingItemId(null);
    },
    [updateItem],
  );

  // Calculate the item count for display
  const itemCount = items ? items.length : 0;
  // Generate a unique ID for the collapsible content region
  const contentId = `${id}-content`;

  return (
    <section id={id}>
      <h2 id={`${id}-heading`}>
        {title} ({itemCount})
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
        {itemCount > 0 ? (
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
                  onEdit={setEditingItemId}
                />
              ))}
            </ul>
          )
        ) : (
          <EmptyState title={title.toLowerCase()} />
        )}
      </div>
      {editingItem && (
        <EditDialog
          item={editingItem}
          onSave={handleEditSave}
          onCancel={closeEditor}
        />
      )}
    </section>
  );
}

export default memo(InventorySection);
