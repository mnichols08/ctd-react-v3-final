import { useMemo } from "react";
import "./App.css";
import Header from "./components/shared/Header/Header.component";
import MainContainer from "./components/ui/MainContainer.component";
import Footer from "./components/shared/Footer.component";
import { useInventoryContext } from "./context/InventoryContext";

function App() {
  const inventory = useInventoryContext();
  const { items, visibleFields, toggleField, resetFields } = inventory;

  // Derived from inventory items — no separate useState needed
  const archivedItemsExist = useMemo(
    () => items.some((item) => item.Status === "archived"),
    [items],
  );

  return (
    <>
      <Header
        visibleFields={visibleFields}
        onToggleField={toggleField}
        onResetFields={resetFields}
        archivedItemsExist={archivedItemsExist}
      />
      <MainContainer inventory={inventory} />
      <Footer />
    </>
  );
}

export default App;
