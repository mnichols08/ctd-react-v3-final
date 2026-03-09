import { useCallback } from "react";
import { actions } from "../reducers/inventoryReducer";
import { patchInventoryItem } from "../data/airtableUtils";

export default function usePersistUpdate(dispatch) {
  return useCallback(
    async (itemId, changedFields, previousItem) => {
      if (import.meta.env.VITE_SAMPLE_DATA === "true") return;
      try {
        // Strip client-only UI state before sending to the API layer
        const { isDeleting: _, ...apiFields } = changedFields;
        const savedItem = await patchInventoryItem(itemId, apiFields);
        dispatch({
          type: actions.updateItem,
          payload: { id: itemId, fields: savedItem },
        });
      } catch (err) {
        dispatch({
          type: actions.updateItem,
          payload: { id: itemId, fields: previousItem },
        });
        dispatch({ type: actions.setSaveError, payload: err.message });
      }
    },
    [dispatch],
  );
}
