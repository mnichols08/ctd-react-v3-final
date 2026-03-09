import { createContext, useContext } from "react";

export const InventoryContext = createContext(null);

export const useInventoryContext = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error(
      "useInventoryContext must be used within an InventoryProvider",
    );
  }
  return context;
};