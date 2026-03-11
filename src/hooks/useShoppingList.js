import { useCallback, useEffect, useRef } from "react";
import { actions } from "../reducers/inventoryReducer";
import { isLocalStorageFallbackMode } from "../data/airtableUtils";
import {
  LOCAL_INVENTORY_SAVE_ERROR,
  saveLocalInventoryItems,
} from "../data/localInventoryStorage";
import usePersistUpdate from "./usePersistUpdate";

export default function useShoppingList({ items, dispatch }) {
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

  const addToShoppingList = useCallback(
    async (itemId, qty) => {
      const item = itemsRef.current.find((i) => i.id === itemId);
      if (!item) return;
      const quantity = Number(qty);
      if (!Number.isFinite(quantity)) return;

      const targetQty = item.QtyOnHand + quantity;

      dispatch({
        type: actions.addToShoppingList,
        payload: { id: itemId, targetQty, timestamp: new Date().toISOString() },
      });

      if (isLocalStorageFallbackMode()) {
        const nextItems = itemsRef.current.map((currentItem) =>
          currentItem.id === itemId
            ? {
                ...currentItem,
                NeedRestock: true,
                TargetQty: targetQty,
                LastUpdated: new Date().toISOString(),
              }
            : currentItem,
        );
        persistLocalItems(nextItems);
        return true;
      }

      await persistUpdate(
        itemId,
        { NeedRestock: true, TargetQty: targetQty },
        item,
      );
    },
    [dispatch, persistLocalItems,persistUpdate],
  );

  const removeFromShoppingList = useCallback(
    async (itemId) => {
      const item = itemsRef.current.find((i) => i.id === itemId);
      if (!item) return;

      dispatch({
        type: actions.removeFromShoppingList,
        payload: { id: itemId, timestamp: new Date().toISOString() },
      });

      if (isLocalStorageFallbackMode()) {
        const nextItems = itemsRef.current.map((currentItem) =>
          currentItem.id === itemId
            ? {
                ...currentItem,
                NeedRestock: false,
                TargetQty: currentItem.QtyOnHand,
                LastUpdated: new Date().toISOString(),
              }
            : currentItem,
        );
        persistLocalItems(nextItems);
        return true;
      }

      await persistUpdate(
        itemId,
        { NeedRestock: false, TargetQty: item.QtyOnHand },
        item,
      );
    },
    [dispatch, persistLocalItems, persistUpdate],
  );

  const updateTargetQty = useCallback(
    async (itemId, newQty) => {
      const item = itemsRef.current.find((i) => i.id === itemId);
      if (!item) return;
      const targetQty = Number(newQty);
      if (!Number.isFinite(targetQty)) return;

      dispatch({
        type: actions.updateTargetQty,
        payload: { id: itemId, targetQty, timestamp: new Date().toISOString() },
      });

      if (isLocalStorageFallbackMode()) {
        const nextItems = itemsRef.current.map((currentItem) => {
          if (currentItem.id !== itemId) return currentItem;
          if (targetQty <= currentItem.QtyOnHand) {
            return {
              ...currentItem,
              NeedRestock: false,
              TargetQty: currentItem.QtyOnHand,
              LastUpdated: new Date().toISOString(),
            };
          }
          return {
            ...currentItem,
            TargetQty: targetQty,
            LastUpdated: new Date().toISOString(),
          };
        });
        persistLocalItems(nextItems);
        return true;
      }

      const changedFields =
        targetQty <= item.QtyOnHand
          ? { NeedRestock: false, TargetQty: item.QtyOnHand }
          : { TargetQty: targetQty };

      await persistUpdate(itemId, changedFields, item);
    },
    [dispatch, persistLocalItems, persistUpdate],
  );

  return {
    addToShoppingList,
    removeFromShoppingList,
    updateTargetQty,
  };
}
