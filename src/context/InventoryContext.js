import { createContext, useContext } from "react";

// Split contexts: data, UI state, and actions (stable callbacks)
export const InventoryDataContext = createContext(null);
export const InventoryUIContext = createContext(null);
export const InventoryActionsContext = createContext(null);

export const useInventoryData = () => {
  const context = useContext(InventoryDataContext);
  if (!context) {
    throw new Error(
      "useInventoryData must be used within an InventoryProvider",
    );
  }
  return context;
};

export const useInventoryUI = () => {
  const context = useContext(InventoryUIContext);
  if (!context) {
    throw new Error("useInventoryUI must be used within an InventoryProvider");
  }
  return context;
};

export const useInventoryActions = () => {
  const context = useContext(InventoryActionsContext);
  if (!context) {
    throw new Error(
      "useInventoryActions must be used within an InventoryProvider",
    );
  }
  return context;
};
