import { useCallback } from "react";
import { actions } from "../reducers/inventoryReducer";

export default function useUIToggles({ dispatch }) {
  const toggleQuickAdd = useCallback(
    () => dispatch({ type: actions.toggleQuickAdd }),
    [dispatch],
  );

  const toggleShowArchived = useCallback(
    () => dispatch({ type: actions.toggleShowArchived }),
    [dispatch],
  );

  const dismissSaveError = useCallback(
    () => dispatch({ type: actions.setSaveError, payload: null }),
    [dispatch],
  );

  return { toggleQuickAdd, toggleShowArchived, dismissSaveError };
}
