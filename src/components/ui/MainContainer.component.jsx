import inventorySampleData from "../../data/inventoryData.json";
import ToolSection from "../sections/ToolSection.component";
import QuickStatsBar from "./QuickStatsBar.component";
import AddInventoryItemForm from "../forms/AddInventoryItemForm.component";
import InventorySection from "../sections/InventorySection.component";
import FilterBar from "./FilterBar.component";

function MainContainer() {
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
        items={inventorySampleData.records.filter((item) =>
          item.Location.includes("Fridge"),
        )}
      />
      <InventorySection
        id="freezer"
        title="Freezer"
        items={inventorySampleData.records.filter((item) =>
          item.Location.includes("Freezer"),
        )}
      />
      <InventorySection
        id="pantry"
        title="Pantry"
        items={inventorySampleData.records.filter((item) =>
          item.Location.includes("Pantry"),
        )}
      />
      <InventorySection id="shopping-list" title="Shopping List" />
      <ToolSection id="filter" title="Filter & Sort">
        <FilterBar />
      </ToolSection>
    </main>
  );
}

export default MainContainer;
