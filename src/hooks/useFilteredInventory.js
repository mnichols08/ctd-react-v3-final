import { useMemo } from "react";
import {
  getActiveFilterCount,
  isExpiringSoon,
  isLowStock,
  sortItems,
} from "../data/inventoryUtils";
import { SEARCHABLE_FIELDS } from "../data/fieldConfig";

export default function useFilteredInventory(
  inventoryItems,
  searchTerm,
  filters,
  sortConfig,
) {
  // Filter by search term across searchable fields (case-insensitive, null-safe)
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

  // Apply category / expiring / low-stock filters
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

  const activeFilterCount = useMemo(
    () => getActiveFilterCount(filters),
    [filters],
  );

  // Sort filtered items
  const sortedItems = useMemo(
    () => sortItems(filterAppliedItems, sortConfig.field, sortConfig.direction),
    [filterAppliedItems, sortConfig.field, sortConfig.direction],
  );

  // Partition by location / status
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

  return {
    filterAppliedItems,
    activeFilterCount,
    fridgeItems,
    freezerItems,
    pantryItems,
    shoppingListItems,
    archivedItems,
  };
}
