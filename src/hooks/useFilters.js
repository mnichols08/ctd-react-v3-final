import { useCallback, useReducer } from "react";

const DEFAULT_FILTERS = {
  categories: [],
  expiringSoon: false,
  lowStock: false,
  needRestock: false,
  status: "",
};

const initialState = {
  searchTerm: "",
  sortConfig: { field: "ItemName", direction: "asc" },
  filters: DEFAULT_FILTERS,
};

function filterReducer(state, action) {
  switch (action.type) {
    case "setSearch":
      return { ...state, searchTerm: action.payload };
    case "setSort":
      return {
        ...state,
        sortConfig: {
          field: action.payload.field,
          direction: action.payload.direction,
        },
      };
    case "setFilters":
      return { ...state, filters: action.payload };
    case "clearFilters":
      return { ...state, filters: DEFAULT_FILTERS, searchTerm: "" };
    default:
      return state;
  }
}

export default function useFilters() {
  const [state, dispatch] = useReducer(filterReducer, initialState);

  const setSearch = useCallback((term) => {
    dispatch({ type: "setSearch", payload: term });
  }, []);

  const setSort = useCallback((field, direction) => {
    dispatch({ type: "setSort", payload: { field, direction } });
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: "setFilters", payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: "clearFilters" });
  }, []);

  return {
    searchTerm: state.searchTerm,
    sortConfig: state.sortConfig,
    filters: state.filters,
    setSearch,
    setSort,
    setFilters,
    clearFilters,
  };
}
