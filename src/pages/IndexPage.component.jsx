import { memo } from "react";
import {
    useInventoryData,
    useInventoryUI,
    useInventoryActions,
} from "../context/InventoryContext";
import useAutoRefresh from "../hooks/useAutoRefresh";
import LoadingState from "../components/ui/LoadingState.component";
import ErrorState from "../components/ui/ErrorState.component";
import ToolSection from "../components/sections/ToolSection.component";
import QuickStatsBar from "../components/ui/QuickStatsBar.component";
import AddInventoryItemForm from "../components/forms/AddInventoryItemForm.component";
import QuickAddForm from "../components/forms/QuickAddForm.component";
import InventorySection from "../components/sections/InventorySection.component";
import FilterBarForm from "../components/forms/FilterBarForm.component";

function IndexPage() {
  const {
    items,
    isLoading,
    error,
    lastFetchedAt,
    partialLoadWarning,
    searchTerm,
    sortConfig,
    filters,
    filterAppliedItems,
    activeFilterCount,
    fridgeItems,
    freezerItems,
    pantryItems,
    shoppingListItems,
    archivedItems,
  } = useInventoryData();
  const { showQuickAdd, showArchived, isSaving, saveError } = useInventoryUI();
  const { refetch, toggleQuickAdd, toggleShowArchived, dismissSaveError } =
    useInventoryActions();

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
      <LoadingState />
      <ErrorState />
      {partialLoadWarning && (
        <div role="alert">
          <p>Warning: {partialLoadWarning}</p>
        </div>
      )}
      {!isLoading && !error && (
        <>
          <ToolSection id="stats" title="Quick Stats">
            <QuickStatsBar />
          </ToolSection>
          <ToolSection id="filter" title="Filter & Sort">
            <FilterBarForm />
            {(searchTerm.trim() || activeFilterCount > 0) && (
              <p>
                Showing {filterAppliedItems.length} of {items.length} items
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
                <p>{saveError}</p>
                <button type="button" onClick={dismissSaveError}>
                  Dismiss
                </button>
              </div>
            )}
            {showQuickAdd ? <QuickAddForm /> : <AddInventoryItemForm />}
          </ToolSection>
          <InventorySection id="fridge" title="Fridge" items={fridgeItems} />
          <InventorySection id="freezer" title="Freezer" items={freezerItems} />
          <InventorySection id="pantry" title="Pantry" items={pantryItems} />
          <InventorySection
            id="shopping-list"
            title="Shopping List"
            items={shoppingListItems}
            variant="shopping"
          />
          {/* Archived Items Toggle & Section */}
          {archivedItems.length > 0 && (
            <div>
              <button type="button" onClick={toggleShowArchived}>
                {showArchived ? "Hide Archived Items" : `Show Archived Items`} (
                {archivedItems.length})
              </button>
              {showArchived && (
                <InventorySection
                  id="archived"
                  title="Archived Items"
                  items={archivedItems}
                  variant="archived"
                />
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default memo(IndexPage);
