import { useMemo } from "react";
import inventorySampleData from "../../data/inventoryData.json";
import ToolSection from "../sections/ToolSection.component";
import QuickStatsBar from "./QuickStatsBar.component";
import AddInventoryItemForm from "../forms/AddInventoryItemForm.component";
import InventorySection from "../sections/InventorySection.component";
import FilterBarForm from "../forms/FilterBarForm.component";

function MainContainer() {
  const inventoryItems = useMemo(() => {
    return inventorySampleData.records.map((item) => ({
      id: item.id,
      ...item,
    }));
  }, []);
  return (
    <main>
      <ToolSection id="stats" title="Quick Stats">
        <QuickStatsBar />
      </ToolSection>
      <ToolSection id="add-item" title="Add Item">
        <AddInventoryItemForm />
      </ToolSection>
      <InventorySection
        id="fridge"
        title="Fridge"
        items={inventoryItems.filter((item) =>
          item.Location.includes("Fridge"),
        )}
      />
      <InventorySection
        id="freezer"
        title="Freezer"
        items={inventoryItems.filter((item) =>
          item.Location.includes("Freezer"),
        )}
      />
      <InventorySection
        id="pantry"
        title="Pantry"
        items={inventoryItems.filter((item) =>
          item.Location.includes("Pantry"),
        )}
      />
      {/* Render Shopping List based upon NeedRestock and TargetQty vs QtyOnHand */}
      <InventorySection
        id="shopping-list"
        title="Shopping List"
        shoppingCart
        items={inventoryItems.filter((item) => item.NeedRestock === "checked" && item.TargetQty > item.QtyOnHand)}
      />
      <ToolSection id="filter" title="Filter & Sort">
        <FilterBarForm />
      </ToolSection>
    </main>
  );
}

export default MainContainer;
