import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getActiveFilterCount,
  isExpiringSoon,
  isLowStock,
  sortItems,
} from "../../data/inventoryUtils";
import {
  fetchInventoryItems,
  loadSampleData,
  createInventoryItem,
  patchInventoryItem,
  deleteInventoryItem,
} from "../../data/airtableUtils";
import LoadingState from "./LoadingState.component";
import ErrorState from "./ErrorState.component";
import ToolSection from "../sections/ToolSection.component";
import QuickStatsBar from "./QuickStatsBar.component";
import AddInventoryItemForm from "../forms/AddInventoryItemForm.component";
import QuickAddForm from "../forms/QuickAddForm.component";
import InventorySection from "../sections/InventorySection.component";
import FilterBarForm from "../forms/FilterBarForm.component";

// Searchable fields for filtering inventory items
const SEARCHABLE_FIELDS = ["ItemName", "Brand", "Category", "Tags", "Notes"];
const DEFAULT_FILTERS = {
  categories: [],
  expiringSoon: false,
  lowStock: false,
  needRestock: false,
  status: "",
};

// Auto-refresh if data is older than this threshold (5 minutes)
const STALE_TIME_MS = 5 * 60 * 1000;
// How often to check for stale data while the tab is visible (60 seconds)
const STALE_CHECK_INTERVAL_MS = 60 * 1000;

/** Returns true if lastFetchedAt is older than the given threshold. */
function isDataStale(lastFetchedAt, threshold = STALE_TIME_MS) {
  if (!lastFetchedAt) return false;
  return Date.now() - lastFetchedAt.getTime() >= threshold;
}

/** Shallow-compare two arrays by length + strict element equality. */
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/** Deep-compare two fetch-param objects ({sortField, sortDirection, filters, searchTerm}). */
function fetchParamsEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (
    a.sortField !== b.sortField ||
    a.sortDirection !== b.sortDirection ||
    a.searchTerm !== b.searchTerm
  ) {
    return false;
  }
  const fa = a.filters;
  const fb = b.filters;
  if (fa === fb) return true;
  if (!fa || !fb) return false;
  if (
    fa.expiringSoon !== fb.expiringSoon ||
    fa.lowStock !== fb.lowStock ||
    fa.needRestock !== fb.needRestock ||
    fa.status !== fb.status
  ) {
    return false;
  }
  return arraysEqual(fa.categories ?? [], fb.categories ?? []);
}

function MainContainer({ visibleFields, setArchivedItemsExist = () => {} }) {
  // Initialize inventory items from sample data, ensuring we have a fresh copy of each item
  const [inventoryItems, setInventoryItems] = useState([]);
  // State to toggle between Quick Add and Full Form
  const [showQuickAdd, setShowQuickAdd] = useState(true);
  // Search term state (updated via debounced callback from FilterBarForm)
  const [searchTerm, setSearchTerm] = useState("");
  // Sorting state (default to sorting by ItemName)
  const [sortField, setSortField] = useState("ItemName");
  // Sort direction state (asc default, can be toggled to desc)
  const [sortDirection, setSortDirection] = useState("asc");
  // Filter state for category, location, restock, and status filters
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  // Toggle state for showing/hiding the archived items section (session only)
  const [showArchived, setShowArchived] = useState(false);
  // State to tell if the inventory is loading (e.g., fetching from API)
  const [isLoading, setIsLoading] = useState(true);
  // State to track if an inventory item is being saved to the API
  const [isSaving, setIsSaving] = useState(false);
  // State to track if there was an error loading or updating inventory items
  const [error, setError] = useState(null);
  // State for save/create errors — shown inline near the form, not replacing the whole UI
  const [saveError, setSaveError] = useState(null);
  // Track the last-fetched sort/filter/search params to avoid redundant API calls
  const lastFetchedParamsRef = useRef(null);
  // Track the timestamp of the last successful fetch to help with debugging and ensuring data freshness
  const [lastFetchedAt, setLastFetchedAt] = useState(null);
  // AbortController for cancelling in-flight fetch requests
  const abortControllerRef = useRef(null);

  // Keep a ref to the latest inventoryItems so handlers can read current
  // state without needing inventoryItems in their dependency arrays.
  const inventoryItemsRef = useRef(inventoryItems);
  useEffect(() => {
    inventoryItemsRef.current = inventoryItems;
  }, [inventoryItems]);

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

  // Ref that always holds the latest fetch-relevant params so the
  // pending-retry path can read current values instead of stale closures.
  const fetchParamsRef = useRef({
    sortField,
    sortDirection,
    filters,
    searchTerm,
  });
  useEffect(() => {
    fetchParamsRef.current = { sortField, sortDirection, filters, searchTerm };
  }, [sortField, sortDirection, filters, searchTerm]);

  // Cancels the in-flight request (if any) and starts a fresh fetch using the
  // latest params from fetchParamsRef.  Callers can pass { setIsLoading: () => {} }
  // to suppress the loading indicator (e.g. background auto-refresh).
  const doFetch = useCallback(
    (overrides = {}) => {
      // Cancel any in-flight request so its response never updates state
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Read current params from the ref so we always use the most
      // up-to-date values regardless of when this callback was created.
      const {
        sortField: sf,
        sortDirection: sd,
        filters: f,
        searchTerm: st,
      } = fetchParamsRef.current;

      lastFetchedParamsRef.current = {
        sortField: sf,
        sortDirection: sd,
        filters: f,
        searchTerm: st,
      };

      fetchInventoryItems({
        setInventoryItems,
        setIsLoading: overrides.setIsLoading ?? setIsLoading,
        setError,
        sortConfig: { field: sf, direction: sd },
        filterConfig: f,
        searchTerm: st,
        setLastFetchedAt,
        signal: controller.signal,
      });
    },
    [], // stable — reads everything from refs
  );

  // Handler to add a new inventory item to local state
  const addInventoryItem = useCallback((newItem) => {
    setInventoryItems((prevItems) => [...prevItems, newItem]);
  }, []);

  // Wrapper that persists to Airtable when connected, or adds directly in sample-data mode
  const handleAddItem = useCallback(
    async (item) => {
      // Clear any previous save error at the start of a new submission
      setSaveError(null);
      if (import.meta.env.VITE_SAMPLE_DATA === "true") {
        addInventoryItem(item);
        // In sample-data mode we treat local add as a successful save
        return true;
      }
      // Propagate the boolean success/failure result to callers
      return await createInventoryItem({
        item,
        addInventoryItem,
        setIsSaving,
        setError: setSaveError,
      });
    },
    [addInventoryItem],
  );
  // Persist field changes to Airtable with optimistic rollback on failure
  const persistUpdate = useCallback(
    async (itemId, changedFields, previousItem) => {
      if (import.meta.env.VITE_SAMPLE_DATA === "true") return;
      try {
        const savedItem = await patchInventoryItem(itemId, changedFields);
        setInventoryItems((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, ...savedItem } : i)),
        );
      } catch (error) {
        setInventoryItems((prev) =>
          prev.map((i) => (i.id === itemId ? previousItem : i)),
        );
        setSaveError(error.message);
      }
    },
    [],
  );

  // Handler to add an item to the shopping list (mark as NeedRestock and update TargetQty)
  const addToShoppingList = useCallback(
    async ({ itemId, quantity }) => {
      const item = inventoryItemsRef.current.find((i) => i.id === itemId);
      if (!item) return;
      const qty = Number(quantity);
      if (!Number.isFinite(qty)) return;

      const changedFields = {
        NeedRestock: true,
        TargetQty: item.QtyOnHand + qty,
      };
      setInventoryItems((prevItems) =>
        prevItems.map((i) =>
          i.id === itemId ? { ...i, ...changedFields } : i,
        ),
      );
      await persistUpdate(itemId, changedFields, item);
    },
    [persistUpdate],
  );
  // Handler to remove an item from the shopping list (mark as not NeedRestock and reset TargetQty to QtyOnHand)
  const removeFromShoppingList = useCallback(
    async (itemId) => {
      const item = inventoryItemsRef.current.find((i) => i.id === itemId);
      if (!item) return;

      const changedFields = { NeedRestock: false, TargetQty: item.QtyOnHand };
      setInventoryItems((prevItems) =>
        prevItems.map((i) =>
          i.id === itemId
            ? { ...i, NeedRestock: false, TargetQty: i.QtyOnHand }
            : i,
        ),
      );
      await persistUpdate(itemId, changedFields, item);
    },
    [persistUpdate],
  );
  // Handler to update the TargetQty for a shopping-list item.
  // Automatically removes from shopping list when newTargetQty <= QtyOnHand.
  const updateItemQuantity = useCallback(
    async (itemId, newTargetQty) => {
      const item = inventoryItemsRef.current.find((i) => i.id === itemId);
      if (!item) return;
      const qty = Number(newTargetQty);
      if (!Number.isFinite(qty)) return;

      let changedFields;
      if (qty <= item.QtyOnHand) {
        changedFields = { NeedRestock: false, TargetQty: item.QtyOnHand };
        setInventoryItems((prevItems) =>
          prevItems.map((i) =>
            i.id === itemId
              ? { ...i, NeedRestock: false, TargetQty: i.QtyOnHand }
              : i,
          ),
        );
      } else {
        changedFields = { TargetQty: qty };
        setInventoryItems((prevItems) =>
          prevItems.map((i) =>
            i.id === itemId ? { ...i, TargetQty: qty } : i,
          ),
        );
      }
      await persistUpdate(itemId, changedFields, item);
    },
    [persistUpdate],
  );
  // Handler to update an existing inventory item (edit form save)
  const updateInventoryItem = useCallback(
    async (updatedItem) => {
      const previousItem = inventoryItemsRef.current.find(
        (i) => i.id === updatedItem.id,
      );
      if (!previousItem) return;

      // Compute only the changed fields (exclude id and LastUpdated)
      const changedFields = {};
      for (const key of Object.keys(updatedItem)) {
        if (key === "id" || key === "LastUpdated") continue;
        if (updatedItem[key] !== previousItem[key]) {
          changedFields[key] = updatedItem[key];
        }
      }

      // Optimistic update
      setInventoryItems((prevItems) =>
        prevItems.map((i) => (i.id === updatedItem.id ? updatedItem : i)),
      );

      if (Object.keys(changedFields).length > 0) {
        await persistUpdate(updatedItem.id, changedFields, previousItem);
      }
    },
    [persistUpdate],
  );

  // Handler to archive an item (mark as Status: "archived" and remove from shopping list)
  const archiveItem = useCallback(
    async (itemId) => {
      const item = inventoryItemsRef.current.find((i) => i.id === itemId);
      if (!item || item.Status === "archived") return;

      const changedFields = { Status: "archived", NeedRestock: false };
      setInventoryItems((prevItems) =>
        prevItems.map((i) => {
          if (i.id !== itemId) return i;
          return {
            ...i,
            Status: "archived",
            NeedRestock: false,
            LastUpdated: new Date().toISOString(),
          };
        }),
      );
      await persistUpdate(itemId, changedFields, item);
    },
    [persistUpdate],
  );

  // Handler to unarchive an item
  const unarchiveItem = useCallback(
    async (itemId) => {
      const item = inventoryItemsRef.current.find((i) => i.id === itemId);
      if (!item || item.Status !== "archived") return;

      const changedFields = { Status: null };
      setInventoryItems((prevItems) =>
        prevItems.map((i) => {
          if (i.id !== itemId) return i;
          return {
            ...i,
            Status: null,
            LastUpdated: new Date().toISOString(),
          };
        }),
      );
      await persistUpdate(itemId, changedFields, item);
    },
    [persistUpdate],
  );

  // Handler to delete an item permanently from the inventory
  const deleteItem = useCallback(async (itemId) => {
    const item = inventoryItemsRef.current.find((i) => i.id === itemId);
    if (!item || item.isDeleting) return;

    if (!window.confirm(`Delete "${item.ItemName}"? This cannot be undone.`)) {
      return;
    }

    // Set deleting indicator on the item
    setInventoryItems((prevItems) =>
      prevItems.map((i) => (i.id === itemId ? { ...i, isDeleting: true } : i)),
    );

    if (import.meta.env.VITE_SAMPLE_DATA === "true") {
      setInventoryItems((prevItems) =>
        prevItems.filter((i) => i.id !== itemId),
      );
      return;
    }

    try {
      await deleteInventoryItem(itemId);
      setInventoryItems((prevItems) =>
        prevItems.filter((i) => i.id !== itemId),
      );
    } catch (error) {
      // Remove deleting indicator and show error
      setInventoryItems((prevItems) =>
        prevItems.map((i) =>
          i.id === itemId ? { ...i, isDeleting: false } : i,
        ),
      );
      setSaveError(error.message);
    }
  }, []);

  // Handler to update sort field and direction (sorting is derived, not mutated)
  const handleSort = useCallback((field, direction) => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  // Sort filtered items by the selected field and direction
  const sortedItems = useMemo(
    () => sortItems(filterAppliedItems, sortField, sortDirection),
    [filterAppliedItems, sortField, sortDirection],
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
        sortField,
        sortDirection,
      ),
    [inventoryItems, sortField, sortDirection],
  );

  // Effect to check for archived items whenever the inventory changes and update the state in App accordingly
  useEffect(() => {
    setArchivedItemsExist(
      inventoryItems.some((item) => item.Status === "archived"),
    );
  }, [inventoryItems, setArchivedItemsExist]);

  // Initial load effect — fetch inventory items once on mount
  useEffect(() => {
    if (import.meta.env.VITE_SAMPLE_DATA === "true") {
      // Load sample data from local JSON file for development/testing
      const cleanup = loadSampleData({
        setInventoryItems,
        setIsLoading,
        setError,
      });
      return cleanup;
    }
    doFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cancel in-flight fetch on unmount to prevent state updates after cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Retry handler for error state — re-fetches or reloads sample data
  const handleRetry = useCallback(() => {
    if (import.meta.env.VITE_SAMPLE_DATA === "true") {
      loadSampleData({ setInventoryItems, setIsLoading, setError });
    } else {
      doFetch();
    }
  }, [doFetch]);

  // Force a re-fetch — cancels any in-flight request and starts fresh
  const handleRefresh = useCallback(() => {
    if (import.meta.env.VITE_SAMPLE_DATA === "true") {
      loadSampleData({ setInventoryItems, setIsLoading, setError });
    } else {
      doFetch();
    }
  }, [doFetch]);

  // When server-side filtering is enabled, re-fetch on sort/filter/search changes
  useEffect(() => {
    if (
      import.meta.env.VITE_SAMPLE_DATA === "true" ||
      import.meta.env.VITE_SERVER_FILTER !== "true"
    ) {
      return;
    }
    // Skip fetch if params haven't changed since the last request
    const params = { sortField, sortDirection, filters, searchTerm };
    if (fetchParamsEqual(params, lastFetchedParamsRef.current)) {
      return;
    }
    doFetch();
  }, [sortField, sortDirection, filters, searchTerm, doFetch]);

  // Auto-refresh when the tab regains focus and data is stale
  useEffect(() => {
    if (import.meta.env.VITE_SAMPLE_DATA === "true") return;

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        isDataStale(lastFetchedAt) &&
        !isLoading
      ) {
        doFetch({ setIsLoading: () => {} });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [lastFetchedAt, isLoading, doFetch]);

  // Periodic stale-check while the tab stays visible
  useEffect(() => {
    if (import.meta.env.VITE_SAMPLE_DATA === "true") return;

    const id = setInterval(() => {
      if (
        document.visibilityState === "visible" &&
        isDataStale(lastFetchedAt) &&
        !isLoading
      ) {
        doFetch({ setIsLoading: () => {} });
      }
    }, STALE_CHECK_INTERVAL_MS);

    return () => clearInterval(id);
  }, [lastFetchedAt, isLoading, doFetch]);

  return (
    <main>
      {isLoading ? (
        <LoadingState isLoading={isLoading} />
      ) : error ? (
        <ErrorState error={error} onRetry={handleRetry} />
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
              onSearch={setSearchTerm}
              onSort={handleSort}
              onFilter={setFilters}
              sortField={sortField}
              sortDirection={sortDirection}
              filters={filters}
              inventoryItems={inventoryItems}
            />
            <button type="button" onClick={handleRefresh}>
              Refresh
            </button>
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
            <button onClick={() => setShowQuickAdd((prev) => !prev)}>
              {showQuickAdd ? "Switch to Full Form" : "Switch to Quick Add"}
            </button>
            {isSaving && <p role="status">Saving item to Airtable…</p>}
            {saveError && (
              <div role="alert">
                <p>Error: {saveError}</p>
                <button type="button" onClick={() => setSaveError(null)}>
                  Dismiss
                </button>
              </div>
            )}
            {showQuickAdd ? (
              <QuickAddForm addInventoryItem={handleAddItem} />
            ) : (
              <AddInventoryItemForm addInventoryItem={handleAddItem} />
            )}
          </ToolSection>
          <InventorySection
            id="fridge"
            title="Fridge"
            addToShoppingList={addToShoppingList}
            removeFromShoppingList={removeFromShoppingList}
            updateItem={updateInventoryItem}
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
            updateItem={updateInventoryItem}
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
            updateItem={updateInventoryItem}
            visibleFields={visibleFields}
            items={pantryItems}
            archiveItem={archiveItem}
            deleteItem={deleteItem}
          />
          {/* Render Shopping List based upon NeedRestock and TargetQty vs QtyOnHand */}
          <InventorySection
            id="shopping-list"
            title="Shopping List"
            updateItemQuantity={updateItemQuantity}
            items={shoppingListItems}
          />
          {/* Archived Items Toggle & Section */}
          {archivedItems.length > 0 && (
            <div id="archived">
              <button
                type="button"
                onClick={() => setShowArchived((prev) => !prev)}
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
