import { STALE_TIME_MS } from "../../data/inventoryUtils";
import useFilteredInventory from "../../hooks/useFilteredInventory";
import useAutoRefresh from "../../hooks/useAutoRefresh";
import LoadingState from "./LoadingState.component";
import ErrorState from "./ErrorState.component";
import ToolSection from "../sections/ToolSection.component";
import QuickStatsBar from "./QuickStatsBar.component";
import AddInventoryItemForm from "../forms/AddInventoryItemForm.component";
import QuickAddForm from "../forms/QuickAddForm.component";
import InventorySection from "../sections/InventorySection.component";
import FilterBarForm from "../forms/FilterBarForm.component";

function MainContainer({ inventory }) {
  const {
    items: inventoryItems,
    isLoading,
    error,
    showQuickAdd,
    showArchived,
    isSaving,
    saveError,
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
    toggleQuickAdd,
    toggleShowArchived,
    dismissSaveError,
    addToShoppingList,
    removeFromShoppingList,
    updateTargetQty,
  } = inventory;

  const {
    filterAppliedItems,
    activeFilterCount,
    fridgeItems,
    freezerItems,
    pantryItems,
    shoppingListItems,
    archivedItems,
  } = useFilteredInventory(inventoryItems, searchTerm, filters, sortConfig);

  useAutoRefresh({
    sortConfig,
    filters,
    searchTerm,
    refetch,
    lastFetchedAt,
    isLoading,
  });

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
            <button onClick={toggleQuickAdd}>
              {showQuickAdd ? "Switch to Full Form" : "Switch to Quick Add"}
            </button>
            {isSaving && <p role="status">Saving item to Airtable…</p>}
            {saveError && (
              <div role="alert">
                <p>Error: {saveError}</p>
                <button type="button" onClick={dismissSaveError}>
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
              <button type="button" onClick={toggleShowArchived}>
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
