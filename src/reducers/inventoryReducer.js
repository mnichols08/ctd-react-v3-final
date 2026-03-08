export const actions = {
  addItem: "addItem",
  deleteItem: "deleteItem",
  archiveItem: "archiveItem",
  unarchiveItem: "unarchiveItem",
  updateItem: "updateItem",
  addToShoppingList: "addToShoppingList",
  removeFromShoppingList: "removeFromShoppingList",
  updateTargetQty: "updateTargetQty",
  setItems: "setItems",
  setLoading: "setLoading",
  setError: "setError",
  setFilters: "setFilters",
  setSort: "setSort",
  setSearch: "setSearch",
};

export const initialState = {
  items: [],
  isLoading: true,
  error: null,
  searchTerm: "",
  sortConfig: { field: null, direction: "asc" },
  filters: { categories: [], location: null, needRestock: null, status: null },
};
