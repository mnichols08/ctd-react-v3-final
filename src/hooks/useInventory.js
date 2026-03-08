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

export default function useInventory() {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);
  const { items, isLoading, error } = state;

  // Ref for reading current items in callbacks without stale closures
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // AbortController for cancelling in-flight fetches
  const abortControllerRef = useRef(null);

  // --- Initial data fetch ---
  useEffect(() => {
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
        dispatch({ type: actions.setError, payload: err.message });
      }
    },
    [],
  );

  // --- Action functions ---

  const addItem = useCallback(async (item) => {
    if (import.meta.env.VITE_SAMPLE_DATA === "true") {
      dispatch({ type: actions.addItem, payload: item });
      return true;
    }
    try {
      const success = await createInventoryItem({
        item,
        addInventoryItem: (savedItem) =>
          dispatch({ type: actions.addItem, payload: savedItem }),
        setIsSaving: () => {},
        setError: (msg) => dispatch({ type: actions.setError, payload: msg }),
      });
      return success;
    } catch (err) {
      dispatch({ type: actions.setError, payload: err.message });
      return false;
    }
  }, []);

  const deleteItem = useCallback(async (id) => {
    const item = itemsRef.current.find((i) => i.id === id);
    if (!item) return;

    if (import.meta.env.VITE_SAMPLE_DATA === "true") {
      dispatch({ type: actions.deleteItem, payload: id });
      return;
    }

    try {
      await deleteInventoryItem(id);
      dispatch({ type: actions.deleteItem, payload: id });
    } catch (err) {
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

  return {
    items,
    isLoading,
    error,
    dispatch,
    addItem,
    deleteItem,
    updateItem,
    archiveItem,
    unarchiveItem,
  };
}
