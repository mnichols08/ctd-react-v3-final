import { useMemo } from "react";
import { InventoryContext } from "./InventoryContext";
import useInventory from "../hooks/useInventory";
import useFilteredInventory from "../hooks/useFilteredInventory";

export const InventoryProvider = ({ children }) => {
  const {
    items, isLoading, error, showQuickAdd, showArchived,
    isSaving, saveError, addItem, deleteItem, updateItem,
    archiveItem, unarchiveItem, refetch, lastFetchedAt,
    searchTerm, sortConfig, filters, setSearch, setSort,
    setFilters, clearFilters, visibleFields, toggleField,
    resetFields, toggleQuickAdd, toggleShowArchived,
    dismissSaveError, addToShoppingList, removeFromShoppingList,
    updateTargetQty,
  } = useInventory();

  const {
    filterAppliedItems, activeFilterCount, fridgeItems,
    freezerItems, pantryItems, shoppingListItems, archivedItems,
  } = useFilteredInventory(items, searchTerm, filters, sortConfig);

  const contextValue = useMemo(
    () => ({
      items, isLoading, error, showQuickAdd, showArchived,
      isSaving, saveError, addItem, deleteItem, updateItem,
      archiveItem, unarchiveItem, refetch, lastFetchedAt,
      searchTerm, sortConfig, filters, setSearch, setSort,
      setFilters, clearFilters, visibleFields, toggleField,
      resetFields, toggleQuickAdd, toggleShowArchived,
      dismissSaveError, addToShoppingList, removeFromShoppingList,
      updateTargetQty, filterAppliedItems, activeFilterCount,
      fridgeItems, freezerItems, pantryItems, shoppingListItems,
      archivedItems,
    }),
    [
      items, isLoading, error, showQuickAdd, showArchived,
      isSaving, saveError, addItem, deleteItem, updateItem,
      archiveItem, unarchiveItem, refetch, lastFetchedAt,
      searchTerm, sortConfig, filters, setSearch, setSort,
      setFilters, clearFilters, visibleFields, toggleField,
      resetFields, toggleQuickAdd, toggleShowArchived,
      dismissSaveError, addToShoppingList, removeFromShoppingList,
      updateTargetQty, filterAppliedItems, activeFilterCount,
      fridgeItems, freezerItems, pantryItems, shoppingListItems,
      archivedItems,
    ],
  );

  return (
    <InventoryContext.Provider value={contextValue}>
      {children}
    </InventoryContext.Provider>
  );
};