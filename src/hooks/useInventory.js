import { useCallback, useEffect, useReducer, useRef } from "react";
import inventoryReducer, {
  actions,
  initialState,
} from "../reducers/inventoryReducer";
import {
  fetchInventoryItems,
  loadSampleData,
  createInventoryItem,
  patchInventoryItem,
  deleteInventoryItem,
} from "../data/airtableUtils";
import useShoppingList from "./useShoppingList";

export default function useInventory() {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);
  const {
    items,
    isLoading,
    error,
    showQuickAdd,
    showArchived,
    isSaving,
    saveError,
    lastFetchedAt,
    searchTerm,
    sortConfig,
    filters,
    visibleFields,
  } = state;

  // Refs for reading current state in callbacks without stale closures
  const itemsRef = useRef(items);
  const sortConfigRef = useRef(state.sortConfig);
  const filtersRef = useRef(state.filters);
  const searchTermRef = useRef(state.searchTerm);
  useEffect(() => {
    itemsRef.current = items;
    sortConfigRef.current = state.sortConfig;
    filtersRef.current = state.filters;
    searchTermRef.current = state.searchTerm;
  }, [items, state.sortConfig, state.filters, state.searchTerm]);

  // AbortController for cancelling in-flight fetches
  const abortControllerRef = useRef(null);

  // --- Initial data fetch ---
  useEffect(() => {
    if (import.meta.env.VITE_SAMPLE_DATA === "true") {
      const cleanup = loadSampleData({
        setInventoryItems: (data) =>
          dispatch({ type: actions.setItems, payload: data }),
        setIsLoading: (val) =>
          dispatch({ type: actions.setLoading, payload: val }),
        setError: (msg) => dispatch({ type: actions.setError, payload: msg }),
      });
      return cleanup;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetchInventoryItems({
      setInventoryItems: (data) =>
        dispatch({ type: actions.setItems, payload: data }),
      setIsLoading: (val) =>
        dispatch({ type: actions.setLoading, payload: val }),
      setError: (msg) => dispatch({ type: actions.setError, payload: msg }),
      sortConfig: state.sortConfig,
      filterConfig: state.filters,
      searchTerm: state.searchTerm,
      setLastFetchedAt: (date) =>
        dispatch({ type: actions.setLastFetchedAt, payload: date }),
      signal: controller.signal,
    });

    return () => controller.abort();
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cancel in-flight fetch on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // --- Optimistic update helper with rollback ---
  const persistUpdate = useCallback(
    async (itemId, changedFields, previousItem) => {
      if (import.meta.env.VITE_SAMPLE_DATA === "true") return;
      try {
        const savedItem = await patchInventoryItem(itemId, changedFields);
        dispatch({
          type: actions.updateItem,
          payload: { id: itemId, fields: savedItem },
        });
      } catch (err) {
        // Rollback to previous state
        dispatch({
          type: actions.updateItem,
          payload: { id: itemId, fields: previousItem },
        });
        dispatch({ type: actions.setSaveError, payload: err.message });
      }
    },
    [],
  );

  // --- Action functions ---

  const addItem = useCallback(async (item) => {
    dispatch({ type: actions.setSaveError, payload: null });
    if (import.meta.env.VITE_SAMPLE_DATA === "true") {
      dispatch({ type: actions.addItem, payload: item });
      return true;
    }
    try {
      const success = await createInventoryItem({
        item,
        addInventoryItem: (savedItem) =>
          dispatch({ type: actions.addItem, payload: savedItem }),
        setIsSaving: (val) =>
          dispatch({ type: actions.setIsSaving, payload: val }),
        setError: (msg) =>
          dispatch({ type: actions.setSaveError, payload: msg }),
      });
      return success;
    } catch (err) {
      dispatch({ type: actions.setSaveError, payload: err.message });
      return false;
    }
  }, []);

  const deleteItem = useCallback(async (id) => {
    const item = itemsRef.current.find((i) => i.id === id);
    if (!item || item.isDeleting) return;

    if (!window.confirm(`Delete "${item.ItemName}"? This cannot be undone.`)) {
      return;
    }

    dispatch({ type: actions.setDeleting, payload: { id, value: true } });

    if (import.meta.env.VITE_SAMPLE_DATA === "true") {
      dispatch({ type: actions.deleteItem, payload: id });
      return;
    }

    try {
      await deleteInventoryItem(id);
      dispatch({ type: actions.deleteItem, payload: id });
    } catch (err) {
      dispatch({ type: actions.setDeleting, payload: { id, value: false } });
      dispatch({ type: actions.setError, payload: err.message });
    }
  }, []);

  const updateItem = useCallback(
    async (id, fields) => {
      const previousItem = itemsRef.current.find((i) => i.id === id);
      if (!previousItem) return;

      // Optimistic update
      dispatch({
        type: actions.updateItem,
        payload: { id, fields },
      });

      await persistUpdate(id, fields, previousItem);
    },
    [persistUpdate],
  );

  const archiveItem = useCallback(
    async (id) => {
      const item = itemsRef.current.find((i) => i.id === id);
      if (!item || item.Status === "archived") return;

      // Optimistic update
      dispatch({ type: actions.archiveItem, payload: id });

      const changedFields = { Status: "archived", NeedRestock: false };
      await persistUpdate(id, changedFields, item);
    },
    [persistUpdate],
  );

  const unarchiveItem = useCallback(
    async (id) => {
      const item = itemsRef.current.find((i) => i.id === id);
      if (!item || item.Status !== "archived") return;

      // Optimistic update
      dispatch({ type: actions.unarchiveItem, payload: id });

      const changedFields = { Status: null };
      await persistUpdate(id, changedFields, item);
    },
    [persistUpdate],
  );

  // Re-run the fetch/load logic (for retry, refresh, or re-fetch with new params)
  const refetch = useCallback((options = {}) => {
    if (import.meta.env.VITE_SAMPLE_DATA === "true") {
      loadSampleData({
        setInventoryItems: (data) =>
          dispatch({ type: actions.setItems, payload: data }),
        setIsLoading: (val) =>
          dispatch({ type: actions.setLoading, payload: val }),
        setError: (msg) => dispatch({ type: actions.setError, payload: msg }),
      });
      return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetchInventoryItems({
      setInventoryItems: (data) =>
        dispatch({ type: actions.setItems, payload: data }),
      setIsLoading: options.silent
        ? () => {}
        : (val) => dispatch({ type: actions.setLoading, payload: val }),
      setError: (msg) => dispatch({ type: actions.setError, payload: msg }),
      sortConfig: options.sortConfig ?? sortConfigRef.current,
      filterConfig: options.filterConfig ?? filtersRef.current,
      searchTerm: options.searchTerm ?? searchTermRef.current,
      setLastFetchedAt: (date) =>
        dispatch({ type: actions.setLastFetchedAt, payload: date }),
      signal: controller.signal,
    });
  }, []);

  // --- Filter / sort / search / field visibility dispatchers ---

  const setSearch = useCallback((term) => {
    dispatch({ type: actions.setSearch, payload: term });
  }, []);

  const setSort = useCallback((field, direction) => {
    dispatch({ type: actions.setSort, payload: { field, direction } });
  }, []);

  const setFilters = useCallback((newFilters) => {
    dispatch({ type: actions.setFilters, payload: newFilters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: actions.clearFilters });
  }, []);

  const toggleField = useCallback((key) => {
    dispatch({ type: actions.toggleField, payload: key });
  }, []);

  const resetFields = useCallback(() => {
    dispatch({ type: actions.resetFields });
  }, []);

  const toggleQuickAdd = useCallback(() => {
    dispatch({ type: actions.toggleQuickAdd });
  }, []);

  const toggleShowArchived = useCallback(() => {
    dispatch({ type: actions.toggleShowArchived });
  }, []);

  const dismissSaveError = useCallback(() => {
    dispatch({ type: actions.setSaveError, payload: null });
  }, []);

  const {
    shoppingListItems,
    shoppingListCount,
    addToShoppingList,
    removeFromShoppingList,
    updateTargetQty,
  } = useShoppingList({ items, dispatch });

  return {
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
    shoppingListItems,
    shoppingListCount,
    addToShoppingList,
    removeFromShoppingList,
    updateTargetQty,
  };
}
