import { useMemo } from "react";
import {
  getActiveFilterCount,
  isExpiringSoon,
  isLowStock,
  sortItems,
} from "../data/inventoryUtils";
import {
  SEARCHABLE_FIELDS,
  LOCATIONS,
  parseLocation,
} from "../data/fieldConfig";

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

  // Sort all items once (used for archived partition)
  const allSortedItems = useMemo(
    () => sortItems(inventoryItems, sortConfig.field, sortConfig.direction),
    [inventoryItems, sortConfig.field, sortConfig.direction],
  );

  // Sort filtered items
  const sortedItems = useMemo(
    () => sortItems(filterAppliedItems, sortConfig.field, sortConfig.direction),
    [filterAppliedItems, sortConfig.field, sortConfig.direction],
  );

  // Partition sorted items by location / status in a single pass
  const { fridgeItems, freezerItems, pantryItems, shoppingListItems } =
    useMemo(() => {
      const locationMap = Object.fromEntries(LOCATIONS.map((loc) => [loc, []]));
      const shoppingListItems = [];
      for (const item of sortedItems) {
        const isArchived = item.Status === "archived";
        if (!isArchived) {
          const { location } = parseLocation(item.Location);
          if (location in locationMap) locationMap[location].push(item);
          if (item.NeedRestock && item.TargetQty > item.QtyOnHand) {
            shoppingListItems.push(item);
          }
        }
      }
      return {
        fridgeItems: locationMap["Fridge"],
        freezerItems: locationMap["Freezer"],
        pantryItems: locationMap["Pantry"],
        shoppingListItems,
      };
    }, [sortedItems]);

  const archivedItems = useMemo(
    () => allSortedItems.filter((item) => item.Status === "archived"),
    [allSortedItems],
  );

  return {
    filterAppliedItems: sortedItems,
    activeFilterCount,
    fridgeItems,
    freezerItems,
    pantryItems,
    shoppingListItems,
    archivedItems,
  };
}
