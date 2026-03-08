import { useCallback } from "react";
import { actions } from "../reducers/inventoryReducer";

export default function useFilters({
  searchTerm,
  sortConfig,
  filters,
  dispatch,
}) {
  const setSearch = useCallback(
    (term) => dispatch({ type: actions.setSearch, payload: term }),
    [dispatch],
  );

  const setSort = useCallback(
    (field, direction) =>
      dispatch({ type: actions.setSort, payload: { field, direction } }),
    [dispatch],
  );

  const setFilters = useCallback(
    (newFilters) => dispatch({ type: actions.setFilters, payload: newFilters }),
    [dispatch],
  );

  const clearFilters = useCallback(
    () => dispatch({ type: actions.clearFilters }),
    [dispatch],
  );

  return {
    searchTerm,
    sortConfig,
    filters,
    setSearch,
    setSort,
    setFilters,
    clearFilters,
  };
}
