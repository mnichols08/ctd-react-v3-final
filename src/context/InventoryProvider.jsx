import { useMemo } from "react";
import {
  InventoryDataContext,
  InventoryUIContext,
  InventoryActionsContext,
} from "./InventoryContext";
import useInventory from "../hooks/useInventory";
import useFilteredInventory from "../hooks/useFilteredInventory";

export const InventoryProvider = ({ children }) => {
  const {
    items,
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
    loadingProgress,
    partialLoadWarning,
    searchTerm,
    sortConfig,
    filters,
    setSearch,
    setSort,
    setFilters,
    clearFilters,
    visibleFields,
    toggleField,
    resetFields,
    toggleQuickAdd,
    toggleShowArchived,
    dismissSaveError,
    addToShoppingList,
    removeFromShoppingList,
    updateTargetQty,
  } = useInventory();

  const {
    filterAppliedItems,
    activeFilterCount,
    fridgeItems,
    freezerItems,
    pantryItems,
    shoppingListItems,
    archivedItems,
  } = useFilteredInventory(items, searchTerm, filters, sortConfig);

  // Core inventory data — changes when items, loading, or filter results change
  const dataValue = useMemo(
    () => ({
      items,
      isLoading,
      error,
      lastFetchedAt,
      loadingProgress,
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
    }),
    [
      items,
      isLoading,
      error,
      lastFetchedAt,
      loadingProgress,
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
    ],
  );

  // UI-only state — changes when toggles or field visibility change
  const uiValue = useMemo(
    () => ({
      showQuickAdd,
      showArchived,
      isSaving,
      saveError,
      visibleFields,
    }),
    [showQuickAdd, showArchived, isSaving, saveError, visibleFields],
  );

  // Stable callbacks — only change if the underlying useCallback refs change
  const actionsValue = useMemo(
    () => ({
      addItem,
      deleteItem,
      updateItem,
      archiveItem,
      unarchiveItem,
      refetch,
      setSearch,
      setSort,
      setFilters,
      clearFilters,
      toggleField,
      resetFields,
      toggleQuickAdd,
      toggleShowArchived,
      dismissSaveError,
      addToShoppingList,
      removeFromShoppingList,
      updateTargetQty,
    }),
    [
      addItem,
      deleteItem,
      updateItem,
      archiveItem,
      unarchiveItem,
      refetch,
      setSearch,
      setSort,
      setFilters,
      clearFilters,
      toggleField,
      resetFields,
      toggleQuickAdd,
      toggleShowArchived,
      dismissSaveError,
      addToShoppingList,
      removeFromShoppingList,
      updateTargetQty,
    ],
  );

  return (
    <InventoryDataContext.Provider value={dataValue}>
      <InventoryUIContext.Provider value={uiValue}>
        <InventoryActionsContext.Provider value={actionsValue}>
          {children}
        </InventoryActionsContext.Provider>
      </InventoryUIContext.Provider>
    </InventoryDataContext.Provider>
  );
};
