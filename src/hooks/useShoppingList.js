import { useCallback, useEffect, useMemo, useRef } from "react";
import { actions } from "../reducers/inventoryReducer";
import { patchInventoryItem } from "../data/airtableUtils";

export default function useShoppingList(items, dispatch) {
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const shoppingListItems = useMemo(
    () =>
      items.filter(
        (item) => item.NeedRestock && item.TargetQty > item.QtyOnHand,
      ),
    [items],
  );

  const shoppingListCount = shoppingListItems.length;

  const persistUpdate = useCallback(
    async (itemId, changedFields, previousItem) => {
      if (import.meta.env.VITE_SAMPLE_DATA === "true") return;
      try {
        await patchInventoryItem(itemId, changedFields);
      } catch (err) {
        dispatch({
          type: actions.updateItem,
          payload: { id: itemId, fields: previousItem },
        });
        dispatch({ type: actions.setError, payload: err.message });
      }
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
        payload: { id: itemId, targetQty },
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
        payload: itemId,
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
        payload: { id: itemId, targetQty },
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
    shoppingListItems,
    shoppingListCount,
    addToShoppingList,
    removeFromShoppingList,
    updateTargetQty,
  };
}
