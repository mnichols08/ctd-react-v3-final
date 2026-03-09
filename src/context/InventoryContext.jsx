import { createContext, useContext, useMemo } from "react";
import useInventory from "../hooks/useInventory";
import useFilteredInventory from "../hooks/useFilteredInventory";

export const InventoryContext = createContext(null);

export const useInventoryContext = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error(
      "useInventoryContext must be used within an InventoryProvider",
    );
  }
  return context;
};

export const InventoryProvider = ({ children }) => {
  // Get raw inventory data and actions from useInventory
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

  // Get filtered/sorted items and related metadata from useFilteredInventory
  const {
    filterAppliedItems,
    activeFilterCount,
    fridgeItems,
    freezerItems,
    pantryItems,
    shoppingListItems,
    archivedItems,
  } = useFilteredInventory(items, searchTerm, filters, sortConfig);

  // Memoize the entire context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
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
      filterAppliedItems,
      activeFilterCount,
      fridgeItems,
      freezerItems,
      pantryItems,
      shoppingListItems,
      archivedItems,
    ],
  );
  return (
    <InventoryContext.Provider value={contextValue}>
      {children}
    </InventoryContext.Provider>
  );
};
