import { useCallback, useEffect, useRef } from "react";
import { actions } from "../reducers/inventoryReducer";
import usePersistUpdate from "./usePersistUpdate";

export default function useShoppingList({ items, dispatch }) {
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const persistUpdate = usePersistUpdate(dispatch);

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

      await persistUpdate(
        itemId,
        { NeedRestock: true, TargetQty: targetQty },
        item,
      );
    },
    [dispatch, persistUpdate],
  );

  const removeFromShoppingList = useCallback(
    async (itemId) => {
      const item = itemsRef.current.find((i) => i.id === itemId);
      if (!item) return;

      dispatch({
        type: actions.removeFromShoppingList,
        payload: { id: itemId, timestamp: new Date().toISOString() },
      });

      await persistUpdate(
        itemId,
        { NeedRestock: false, TargetQty: item.QtyOnHand },
        item,
      );
    },
    [dispatch, persistUpdate],
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

      const changedFields =
        targetQty <= item.QtyOnHand
          ? { NeedRestock: false, TargetQty: item.QtyOnHand }
          : { TargetQty: targetQty };

      await persistUpdate(itemId, changedFields, item);
    },
    [dispatch, persistUpdate],
  );

  return {
    addToShoppingList,
    removeFromShoppingList,
    updateTargetQty,
  };
}
