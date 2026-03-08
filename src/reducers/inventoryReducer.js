import { DEFAULT_VISIBLE_FIELDS } from "../data/fieldConfig";

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
  toggleQuickAdd: "toggleQuickAdd",
  toggleShowArchived: "toggleShowArchived",
  setIsSaving: "setIsSaving",
  setSaveError: "setSaveError",
  setLastFetchedAt: "setLastFetchedAt",
  toggleField: "toggleField",
  resetFields: "resetFields",
  clearFilters: "clearFilters",
  setDeleting: "setDeleting",
};

export const initialState = {
  items: [],
  isLoading: true,
  error: null,
  showQuickAdd: true,
  showArchived: false,
  isSaving: false,
  saveError: null,
  lastFetchedAt: null,
  searchTerm: "",
  sortConfig: { field: "ItemName", direction: "asc" },
  filters: {
    categories: [],
    location: null,
    needRestock: false,
    status: "",
    expiringSoon: false,
    lowStock: false,
  },
  visibleFields: new Set(DEFAULT_VISIBLE_FIELDS),
};

export default function inventoryReducer(state, action) {
  switch (action.type) {
    case actions.addItem:
      return { ...state, items: [...state.items, action.payload] };

    case actions.deleteItem:
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case actions.archiveItem:
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload
            ? {
                ...item,
                Status: "archived",
                NeedRestock: false,
                LastUpdated: new Date().toISOString(),
              }
            : item,
        ),
      };

    case actions.unarchiveItem:
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload
            ? {
                ...item,
                Status: null,
                LastUpdated: new Date().toISOString(),
              }
            : item,
        ),
      };

    case actions.updateItem:
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                ...action.payload.fields,
                LastUpdated:
                  action.payload.fields.LastUpdated ?? new Date().toISOString(),
              }
            : item,
        ),
      };

    case actions.addToShoppingList:
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                NeedRestock: true,
                TargetQty: action.payload.targetQty,
                LastUpdated: new Date().toISOString(),
              }
            : item,
        ),
      };

    case actions.removeFromShoppingList:
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload
            ? {
                ...item,
                NeedRestock: false,
                TargetQty: item.QtyOnHand,
                LastUpdated: new Date().toISOString(),
              }
            : item,
        ),
      };

    case actions.updateTargetQty: {
      const { id, targetQty } = action.payload;
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.id !== id) return item;
          if (targetQty <= item.QtyOnHand) {
            return {
              ...item,
              NeedRestock: false,
              TargetQty: item.QtyOnHand,
              LastUpdated: new Date().toISOString(),
            };
          }
          return {
            ...item,
            TargetQty: targetQty,
            LastUpdated: new Date().toISOString(),
          };
        }),
      };
    }

    case actions.setDeleting:
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, isDeleting: action.payload.value }
            : item,
        ),
      };

    case actions.setItems:
      return { ...state, items: action.payload };

    case actions.setLoading:
      return { ...state, isLoading: action.payload };

    case actions.setError:
      return { ...state, error: action.payload };

    case actions.setFilters:
      return { ...state, filters: action.payload };

    case actions.setSort:
      return {
        ...state,
        sortConfig: action.payload,
      };

    case actions.setSearch:
      return { ...state, searchTerm: action.payload };

    case actions.toggleQuickAdd:
      return { ...state, showQuickAdd: !state.showQuickAdd };

    case actions.toggleShowArchived:
      return { ...state, showArchived: !state.showArchived };

    case actions.setIsSaving:
      return { ...state, isSaving: action.payload };

    case actions.setSaveError:
      return { ...state, saveError: action.payload };

    case actions.setLastFetchedAt:
      return { ...state, lastFetchedAt: action.payload };

    case actions.toggleField: {
      const next = new Set(state.visibleFields);
      if (next.has(action.payload)) {
        next.delete(action.payload);
      } else {
        next.add(action.payload);
      }
      return { ...state, visibleFields: next };
    }

    case actions.resetFields:
      return { ...state, visibleFields: new Set(DEFAULT_VISIBLE_FIELDS) };

    case actions.clearFilters:
      return {
        ...state,
        filters: {
          categories: [],
          location: null,
          needRestock: false,
          status: "",
          expiringSoon: false,
          lowStock: false,
        },
        searchTerm: "",
      };

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}
