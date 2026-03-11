import {
  memo,
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import useToggle from "../../hooks/useToggle";
import ItemCard from "../cards/ItemCard.component";
import EditDialog from "../ui/EditDialog.component";
import EmptyState from "../ui/EmptyState.component";
import PaginationControls from "../ui/PaginationControls.component";

function InventorySection({ id, title, items, variant = "inventory" }) {
  const itemsList = items ?? [];

  // State to track whether the section is collapsed or expanded
  const isArchivedSection = id === "archived";
  const [isCollapsed, setIsCollapsed] = useToggle(isArchivedSection);
  const toggleButtonRef = useRef(null);
  const handleToggle = () => {
    setIsCollapsed((prev) => !prev);
    // Focus remains on button after toggle
    setTimeout(() => {
      toggleButtonRef.current?.focus();
    }, 0);
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Only one item can be edited at a time (opens in a dialog)
  const [editingItemId, setEditingItemId] = useState(null);
  const editingItem = editingItemId
    ? (itemsList.find((i) => i.id === editingItemId) ?? null)
    : null;
  const closeEditor = useCallback(() => setEditingItemId(null), []);

  // Calculate the item count for display
  const itemCount = itemsList.length;
  const totalPages = itemCount > 0 ? Math.ceil(itemCount / pageSize) : 1;
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const pageStartIndex = (validCurrentPage - 1) * pageSize;
  const paginatedItems = itemsList.slice(
    pageStartIndex,
    pageStartIndex + pageSize,
  );
  const shouldShowPagination = itemCount > pageSize;
  const itemLabel = `${itemCount} item${itemCount === 1 ? "" : "s"}`;
  const headingSummary =
    itemCount > 0
      ? `${itemLabel}, page ${validCurrentPage} of ${totalPages}`
      : itemLabel;

  const syncCurrentPage = useEffectEvent((page) => {
    setCurrentPage(page);
  });

  useEffect(() => {
    if (currentPage !== validCurrentPage) {
      syncCurrentPage(validCurrentPage);
    }
  }, [currentPage, validCurrentPage]);

  // Generate a unique ID for the collapsible content region
  const contentId = `${id}-content`;

  return (
    <section id={id} aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>
        {title} ({headingSummary})
      </h2>{" "}
      {itemCount > 0 && (
        <button
          ref={toggleButtonRef}
          aria-expanded={!isCollapsed}
          aria-controls={contentId}
          onClick={handleToggle}
        >
          {isCollapsed ? "Show Collapsed" : "Collapse"}
        </button>
      )}
      <div id={contentId} role="region" aria-labelledby={`${id}-heading`}>
        {itemCount > 0 ? (
          isCollapsed ? (
            <p>Collapsed</p>
          ) : (
            <>
              <ul aria-label={title}>
                {paginatedItems.map((item, idx) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onEdit={setEditingItemId}
                    variant={variant}
                    onDeleteFocus={(cardRef) => {
                      // Try to focus next item, or previous, or section heading
                      const list = document
                        .getElementById(id)
                        ?.querySelectorAll("li button, li a");
                      if (list && list.length > 0) {
                        if (idx < list.length - 1) {
                          list[idx + 1]?.focus();
                        } else if (idx > 0) {
                          list[idx - 1]?.focus();
                        } else {
                          // Fallback: focus section heading
                          document.getElementById(`${id}-heading`)?.focus();
                        }
                      }
                    }}
                  />
                ))}
              </ul>
              {shouldShowPagination && (
                <PaginationControls
                  currentPage={validCurrentPage}
                  totalItems={itemCount}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  idPrefix={`${id}-pagination`}
                />
              )}
            </>
          )
        ) : (
          <EmptyState title={title.toLowerCase()} />
        )}
      </div>
      {variant === "inventory" && editingItem && (
        <EditDialog item={editingItem} onClose={closeEditor} />
      )}
    </section>
  );
}

export default memo(InventorySection);
