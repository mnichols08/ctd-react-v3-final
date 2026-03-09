import { useCallback, useRef } from "react";
import { actions } from "../reducers/inventoryReducer";
import { patchInventoryItem } from "../data/airtableUtils";

export default function usePersistUpdate(dispatch) {
  // Per-item version counter: prevents a stale response from overwriting
  // a newer optimistic update when concurrent patches race.
  const versionMap = useRef(new Map());

  return useCallback(
    async (itemId, changedFields, previousItem) => {
      if (import.meta.env.VITE_SAMPLE_DATA === "true") return true;

      dispatch({ type: actions.setSaveError, payload: null });

      const version = (versionMap.current.get(itemId) ?? 0) + 1;
      versionMap.current.set(itemId, version);

      try {
        // Strip client-only UI state before sending to the API layer
        const { isDeleting: _, ...apiFields } = changedFields;
        const savedItem = await patchInventoryItem(itemId, apiFields);
        if (versionMap.current.get(itemId) === version) {
          dispatch({
            type: actions.updateItem,
            payload: { id: itemId, fields: savedItem },
          });
        }
        return true;
      } catch (err) {
        if (versionMap.current.get(itemId) === version) {
          dispatch({
            type: actions.updateItem,
            payload: { id: itemId, fields: previousItem },
          });
          dispatch({ type: actions.setSaveError, payload: err.message });
        }
        return false;
      }
    },
    [dispatch],
  );
}
