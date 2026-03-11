import { useCallback } from "react";
import { actions } from "../reducers/inventoryReducer";

export default function useFieldVisibility({ dispatch }) {
  const toggleField = useCallback(
    (key) => dispatch({ type: actions.toggleField, payload: key }),
    [dispatch],
  );

  const resetFields = useCallback(
    () => dispatch({ type: actions.resetFields }),
    [dispatch],
  );

  return { toggleField, resetFields };
}
