import { useCallback, useEffect, useReducer, useRef } from "react";
import inventoryReducer, {
  actions,
  initialState,
} from "../reducers/inventoryReducer";
import { fetchInventoryItems, loadSampleData } from "../data/airtableUtils";
import useFilters from "./useFilters";
import useFieldVisibility from "./useFieldVisibility";
import useUIToggles from "./useUIToggles";
import useInventoryActions from "./useInventoryActions";
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

  // Refs for reading current state in refetch without stale closures
  const sortConfigRef = useRef(state.sortConfig);
  const filtersRef = useRef(state.filters);
  const searchTermRef = useRef(state.searchTerm);
  useEffect(() => {
    sortConfigRef.current = state.sortConfig;
    filtersRef.current = state.filters;
    searchTermRef.current = state.searchTerm;
  }, [state.sortConfig, state.filters, state.searchTerm]);

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

  // --- Composed hooks ---

  const { setSearch, setSort, setFilters, clearFilters } = useFilters({
    dispatch,
  });

  const { toggleField, resetFields } = useFieldVisibility({ dispatch });

  const { toggleQuickAdd, toggleShowArchived, dismissSaveError } = useUIToggles(
    { dispatch },
  );

  const { addItem, deleteItem, updateItem, archiveItem, unarchiveItem } =
    useInventoryActions({ items, dispatch });

  const {
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
    addToShoppingList,
    removeFromShoppingList,
    updateTargetQty,
  };
}
