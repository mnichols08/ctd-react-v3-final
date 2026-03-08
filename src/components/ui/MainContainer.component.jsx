import { useEffect, useMemo, useRef } from "react";
import {
  getActiveFilterCount,
  isExpiringSoon,
  isLowStock,
  sortItems,
  STALE_TIME_MS,
  STALE_CHECK_INTERVAL_MS,
  isDataStale,
  fetchParamsEqual,
} from "../../data/inventoryUtils";
import { SEARCHABLE_FIELDS } from "../../data/fieldConfig";
import useShoppingList from "../../hooks/useShoppingList";
import LoadingState from "./LoadingState.component";
import ErrorState from "./ErrorState.component";
import ToolSection from "../sections/ToolSection.component";
import QuickStatsBar from "./QuickStatsBar.component";
import AddInventoryItemForm from "../forms/AddInventoryItemForm.component";
import QuickAddForm from "../forms/QuickAddForm.component";
import InventorySection from "../sections/InventorySection.component";
import FilterBarForm from "../forms/FilterBarForm.component";

function MainContainer({inventory}) {
  const {
    items: inventoryItems,
    isLoading,
    error,
    showQuickAdd,
    showArchived,
    isSaving,
    saveError,
    dispatch,
    addItem,
    deleteItem,
    updateItem,
    archiveItem,
    unarchiveItem,
    refetch,
    lastFetchedAt,
    searchTerm,
    sortConfig,
    filters,
    setSearch,
    setSort,
    setFilters,
    visibleFields,
  } = inventory;

  const { addToShoppingList, removeFromShoppingList, updateTargetQty } =
    useShoppingList({ items: inventoryItems, dispatch });

  // Filter inventory items by search term across searchable fields (case-insensitive, null-safe)
  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return term
      ? inventoryItems.filter((item) =>
          SEARCHABLE_FIELDS.some((field) => {
            const value = item[field];
            if (value == null) return false;
            return String(value).toLowerCase().includes(term);
          }),
        )
      : inventoryItems;
  }, [inventoryItems, searchTerm]);

  // Apply filters after search but before sort
  const filterAppliedItems = useMemo(
    () =>
      filteredItems.filter((item) => {
        if (
          filters.categories.length > 0 &&
          !filters.categories.includes(item.Category)
        ) {
          return false;
        }
        if (filters.expiringSoon && !isExpiringSoon(item)) return false;
        if (filters.lowStock && !isLowStock(item)) return false;
        return true;
      }),
    [filteredItems, filters],
  );

  // Count of active filters for display
  const activeFilterCount = useMemo(
    () => getActiveFilterCount(filters),
    [filters],
  );

  // Sort filtered items by the selected field and direction
  const sortedItems = useMemo(
    () => sortItems(filterAppliedItems, sortConfig.field, sortConfig.direction),
    [filterAppliedItems, sortConfig.field, sortConfig.direction],
  );

  // Partition sorted items by location and status for each section
  const fridgeItems = useMemo(
    () =>
      sortedItems.filter(
        (item) =>
          item.Location.includes("Fridge") && item.Status !== "archived",
      ),
    [sortedItems],
  );
  const freezerItems = useMemo(
    () =>
      sortedItems.filter(
        (item) =>
          item.Location.includes("Freezer") && item.Status !== "archived",
      ),
    [sortedItems],
  );
  const pantryItems = useMemo(
    () =>
      sortedItems.filter(
        (item) =>
          item.Location.includes("Pantry") && item.Status !== "archived",
      ),
    [sortedItems],
  );
  const shoppingListItems = useMemo(
    () =>
      sortedItems.filter(
        (item) => item.NeedRestock && item.TargetQty > item.QtyOnHand,
      ),
    [sortedItems],
  );
  const archivedItems = useMemo(
    () =>
      sortItems(
        inventoryItems.filter((item) => item.Status === "archived"),
        sortConfig.field,
        sortConfig.direction,
      ),
    [inventoryItems, sortConfig.field, sortConfig.direction],
  );

  // Track last-fetched params to prevent redundant server-side re-fetches
  const lastFetchedParamsRef = useRef({
    sortField: sortConfig.field,
    sortDirection: sortConfig.direction,
    filters,
    searchTerm,
  });

  // When server-side filtering is enabled, re-fetch on sort/filter/search changes
  useEffect(() => {
    if (
      import.meta.env.VITE_SAMPLE_DATA === "true" ||
      import.meta.env.VITE_SERVER_FILTER !== "true"
    ) {
      return;
    }
    // Skip fetch if params haven't changed since the last request
    const params = {
      sortField: sortConfig.field,
      sortDirection: sortConfig.direction,
      filters,
      searchTerm,
    };
    if (fetchParamsEqual(params, lastFetchedParamsRef.current)) {
      return;
    }
    lastFetchedParamsRef.current = params;
    refetch({
      sortConfig,
      filterConfig: filters,
      searchTerm,
    });
  }, [
    sortConfig.field,
    sortConfig.direction,
    filters,
    searchTerm,
    refetch,
    sortConfig,
  ]);

  // Auto-refresh when the tab regains focus and data is stale
  useEffect(() => {
    if (import.meta.env.VITE_SAMPLE_DATA === "true") return;

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        isDataStale(lastFetchedAt) &&
        !isLoading
      ) {
        refetch({ silent: true });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [lastFetchedAt, isLoading, refetch]);

  // Periodic stale-check while the tab stays visible
  useEffect(() => {
    if (import.meta.env.VITE_SAMPLE_DATA === "true") return;

    const id = setInterval(() => {
      if (
        document.visibilityState === "visible" &&
        isDataStale(lastFetchedAt) &&
        !isLoading
      ) {
        refetch({ silent: true });
      }
    }, STALE_CHECK_INTERVAL_MS);

    return () => clearInterval(id);
  }, [lastFetchedAt, isLoading, refetch]);

  return (
    <main>
      {isLoading ? (
        <LoadingState isLoading={isLoading} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          <ToolSection id="stats" title="Quick Stats">
            <QuickStatsBar
              inventoryItems={inventoryItems}
              filteredItems={filterAppliedItems}
              isFiltered={searchTerm.trim() !== "" || activeFilterCount > 0}
              lastFetchedAt={lastFetchedAt}
              staleTimeMs={STALE_TIME_MS}
            />
          </ToolSection>
          <ToolSection id="filter" title="Filter & Sort">
            <FilterBarForm
              onSearch={setSearch}
              onSort={setSort}
              onFilter={setFilters}
              sortField={sortConfig.field}
              sortDirection={sortConfig.direction}
              filters={filters}
              inventoryItems={inventoryItems}
              handleRefresh={refetch}
            />
            {(searchTerm.trim() || activeFilterCount > 0) && (
              <p>
                Showing {filterAppliedItems.length} of {inventoryItems.length}{" "}
                items
                {activeFilterCount > 0 &&
                  ` (${activeFilterCount} filter${activeFilterCount !== 1 ? "s" : ""} active)`}
              </p>
            )}
          </ToolSection>
          <ToolSection id="add-item" title="Add Item">
            {/*  Toggle between Quick Add and Full Form */}
            <button onClick={() => dispatch({ type: "toggleQuickAdd" })}>
              {showQuickAdd ? "Switch to Full Form" : "Switch to Quick Add"}
            </button>
            {isSaving && <p role="status">Saving item to Airtable…</p>}
            {saveError && (
              <div role="alert">
                <p>Error: {saveError}</p>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({ type: "setSaveError", payload: null })
                  }
                >
                  Dismiss
                </button>
              </div>
            )}
            {showQuickAdd ? (
              <QuickAddForm addInventoryItem={addItem} />
            ) : (
              <AddInventoryItemForm addInventoryItem={addItem} />
            )}
          </ToolSection>
          <InventorySection
            id="fridge"
            title="Fridge"
            addToShoppingList={addToShoppingList}
            removeFromShoppingList={removeFromShoppingList}
            updateItem={updateItem}
            visibleFields={visibleFields}
            items={fridgeItems}
            archiveItem={archiveItem}
            deleteItem={deleteItem}
          />
          <InventorySection
            id="freezer"
            title="Freezer"
            addToShoppingList={addToShoppingList}
            removeFromShoppingList={removeFromShoppingList}
            updateItem={updateItem}
            visibleFields={visibleFields}
            items={freezerItems}
            archiveItem={archiveItem}
            deleteItem={deleteItem}
          />
          <InventorySection
            id="pantry"
            title="Pantry"
            addToShoppingList={addToShoppingList}
            removeFromShoppingList={removeFromShoppingList}
            updateItem={updateItem}
            visibleFields={visibleFields}
            items={pantryItems}
            archiveItem={archiveItem}
            deleteItem={deleteItem}
          />
          {/* Render Shopping List based upon NeedRestock and TargetQty vs QtyOnHand */}
          <InventorySection
            id="shopping-list"
            title="Shopping List"
            updateTargetQty={updateTargetQty}
            items={shoppingListItems}
          />
          {/* Archived Items Toggle & Section */}
          {archivedItems.length > 0 && (
            <div id="archived">
              <button
                type="button"
                onClick={() => dispatch({ type: "toggleShowArchived" })}
              >
                {showArchived ? "Hide Archived Items" : `Show Archived Items`} (
                {archivedItems.length})
              </button>
              {showArchived && (
                <InventorySection
                  title="Archived Items"
                  items={archivedItems}
                  unarchiveItem={unarchiveItem}
                  deleteItem={deleteItem}
                />
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default MainContainer;
