import { useCallback, useEffect, useRef } from "react";
import { actions } from "../reducers/inventoryReducer";
import {
  createInventoryItem,
  deleteInventoryItem,
  isLocalStorageFallbackMode,
  isSampleDataMode,
} from "../data/airtableUtils";
import {
  LOCAL_INVENTORY_SAVE_ERROR,
  saveLocalInventoryItems,
} from "../data/localInventoryStorage";
import usePersistUpdate from "./usePersistUpdate";

export default function useInventoryActions({ items, dispatch }) {
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const persistUpdate = usePersistUpdate(dispatch);

  const persistLocalItems = useCallback(
    (nextItems) => {
      if (!isLocalStorageFallbackMode()) return true;
      const didSave = saveLocalInventoryItems(nextItems);
      if (!didSave) {
        dispatch({
          type: actions.setSaveError,
          payload: LOCAL_INVENTORY_SAVE_ERROR,
        });
      }
      return didSave;
    },
    [dispatch],
  );

  const addItem = useCallback(
    async (item) => {
      dispatch({ type: actions.setSaveError, payload: null });
      if (isSampleDataMode()) {
        dispatch({ type: actions.addItem, payload: item });
        return true;
      }
      if (isLocalStorageFallbackMode()) {
        const nextItems = [...itemsRef.current, item];
        dispatch({ type: actions.addItem, payload: item });
        persistLocalItems(nextItems);
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
    },
    [dispatch, persistLocalItems],
  );

  const deleteItem = useCallback(
    async (id) => {
      const item = itemsRef.current.find((i) => i.id === id);
      if (!item || item.isDeleting) return;

      dispatch({ type: actions.setSaveError, payload: null });
      dispatch({ type: actions.setDeleting, payload: { id, value: true } });

      if (isSampleDataMode()) {
        dispatch({ type: actions.deleteItem, payload: id });
        return;
      }

      if (isLocalStorageFallbackMode()) {
        const nextItems = itemsRef.current.filter(
          (currentItem) => currentItem.id !== id,
        );
        dispatch({ type: actions.deleteItem, payload: id });
        persistLocalItems(nextItems);
        return;
      }

      try {
        await deleteInventoryItem(id);
        dispatch({ type: actions.deleteItem, payload: id });
      } catch (err) {
        dispatch({ type: actions.setDeleting, payload: { id, value: false } });
        dispatch({ type: actions.setSaveError, payload: err.message });
      }
    },
    [dispatch, persistLocalItems],
  );

  const updateItem = useCallback(
    async (updatedItem) => {
      const { id, ...fields } = updatedItem;

      const previousItem = itemsRef.current.find((i) => i.id === id);
      if (!previousItem) return;

      // Optimistic UI update with all fields
      dispatch({
        type: actions.updateItem,
        payload: { id, fields, timestamp: new Date().toISOString() },
      });

      // Only send changed fields to Airtable
      const changedFields = {};
      for (const key of Object.keys(fields)) {
        if (fields[key] !== previousItem[key]) {
          changedFields[key] = fields[key];
        }
      }
      if (Object.keys(changedFields).length === 0) return true;

      if (isLocalStorageFallbackMode()) {
        const nextItems = itemsRef.current.map((item) =>
          item.id === id
            ? {
                ...item,
                ...fields,
                LastUpdated: fields.LastUpdated ?? new Date().toISOString(),
              }
            : item,
        );
        persistLocalItems(nextItems);
        return true;
      }

      return await persistUpdate(id, changedFields, previousItem);
    },
    [dispatch, persistLocalItems, persistUpdate],
  );

  const archiveItem = useCallback(
    async (id) => {
      const item = itemsRef.current.find((i) => i.id === id);
      if (!item || item.Status === "archived") return;

      dispatch({
        type: actions.archiveItem,
        payload: { id, timestamp: new Date().toISOString() },
      });

      if (isLocalStorageFallbackMode()) {
        const nextItems = itemsRef.current.map((currentItem) =>
          currentItem.id === id
            ? {
                ...currentItem,
                Status: "archived",
                LastUpdated: new Date().toISOString(),
              }
            : currentItem,
        );
        persistLocalItems(nextItems);
        return true;
      }

      const changedFields = { Status: "archived" };
      await persistUpdate(id, changedFields, item);
    },
    [dispatch, persistLocalItems, persistUpdate],
  );

  const unarchiveItem = useCallback(
    async (id) => {
      const item = itemsRef.current.find((i) => i.id === id);
      if (!item || item.Status !== "archived") return;

      dispatch({
        type: actions.unarchiveItem,
        payload: { id, timestamp: new Date().toISOString() },
      });

      if (isLocalStorageFallbackMode()) {
        const nextItems = itemsRef.current.map((currentItem) =>
          currentItem.id === id
            ? {
                ...currentItem,
                Status: null,
                LastUpdated: new Date().toISOString(),
              }
            : currentItem,
        );
        persistLocalItems(nextItems);
        return true;
      }

      const changedFields = { Status: null };
      await persistUpdate(id, changedFields, item);
    },
    [dispatch, persistLocalItems, persistUpdate],
  );

  return { addItem, deleteItem, updateItem, archiveItem, unarchiveItem };
}
