import { useCallback, useEffect, useRef } from "react";
import { actions } from "../reducers/inventoryReducer";
import {
  createInventoryItem,
  deleteInventoryItem,
} from "../data/airtableUtils";
import usePersistUpdate from "./usePersistUpdate";

export default function useInventoryActions({ items, dispatch }) {
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const persistUpdate = usePersistUpdate(dispatch);

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
  }, [dispatch]);

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
      dispatch({ type: actions.setSaveError, payload: err.message });
    }
  }, [dispatch]);

  const updateItem = useCallback(
    async (id, fields) => {
      const previousItem = itemsRef.current.find((i) => i.id === id);
      if (!previousItem) return;

      dispatch({
        type: actions.updateItem,
        payload: { id, fields },
      });

      await persistUpdate(id, fields, previousItem);
    },
    [dispatch, persistUpdate],
  );

  const archiveItem = useCallback(
    async (id) => {
      const item = itemsRef.current.find((i) => i.id === id);
      if (!item || item.Status === "archived") return;

      dispatch({ type: actions.archiveItem, payload: id });

      const changedFields = { Status: "archived", NeedRestock: false };
      await persistUpdate(id, changedFields, item);
    },
    [dispatch, persistUpdate],
  );

  const unarchiveItem = useCallback(
    async (id) => {
      const item = itemsRef.current.find((i) => i.id === id);
      if (!item || item.Status !== "archived") return;

      dispatch({ type: actions.unarchiveItem, payload: id });

      const changedFields = { Status: null };
      await persistUpdate(id, changedFields, item);
    },
    [dispatch, persistUpdate],
  );

  return { addItem, deleteItem, updateItem, archiveItem, unarchiveItem };
}
