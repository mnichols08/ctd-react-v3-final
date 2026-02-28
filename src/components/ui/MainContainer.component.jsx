import { useState } from "react";
import inventorySampleData from "../../data/inventoryData.json";
import ToolSection from "../sections/ToolSection.component";
import QuickStatsBar from "./QuickStatsBar.component";
import AddInventoryItemForm from "../forms/AddInventoryItemForm.component";
import InventorySection from "../sections/InventorySection.component";
import FilterBarForm from "../forms/FilterBarForm.component";

function MainContainer() {
  const [inventoryItems, setInventoryItems] = useState(() =>
    inventorySampleData.records.map((item) => ({ ...item })),
  );
  const addInventoryItem = (newItem) => {
    setInventoryItems((prevItems) => [...prevItems, newItem]);
  };
  const addToShoppingList = ({ itemId, quantity }) => {
    const item = inventoryItems.find((item) => item.id === itemId);
    if (!item) return;
    const updatedItem = {
      ...item,
      NeedRestock: true,
      TargetQty: item.QtyOnHand + parseInt(quantity, 10),
    };
    setInventoryItems((prevItems) =>
      prevItems.map((i) => (i.id === itemId ? updatedItem : i)),
    );
  };
  const removeFromShoppingList = (itemId) => {
    const item = inventoryItems.find((item) => item.id === itemId);
    if (!item) return;
    const updatedItem = {
      ...item,
      NeedRestock: false,
      TargetQty: item.QtyOnHand,
    };
    setInventoryItems((prevItems) =>
      prevItems.map((item) => (item.id === itemId ? updatedItem : item)),
    );
  };
  return (
    <main>
      <ToolSection id="stats" title="Quick Stats">
        <QuickStatsBar />
      </ToolSection>
      <ToolSection id="add-item" title="Add Item">
        <AddInventoryItemForm addInventoryItem={addInventoryItem} />
      </ToolSection>
      <InventorySection
        id="fridge"
        title="Fridge"
        addToShoppingList={addToShoppingList}
        items={inventoryItems.filter((item) =>
          item.Location.includes("Fridge"),
        )}
      />
      <InventorySection
        id="freezer"
        title="Freezer"
        addToShoppingList={addToShoppingList}
        items={inventoryItems.filter((item) =>
          item.Location.includes("Freezer"),
        )}
      />
      <InventorySection
        id="pantry"
        title="Pantry"
        addToShoppingList={addToShoppingList}
        items={inventoryItems.filter((item) =>
          item.Location.includes("Pantry"),
        )}
      />
      {/* Render Shopping List based upon NeedRestock and TargetQty vs QtyOnHand */}
      <InventorySection
        id="shopping-list"
        title="Shopping List"
        removeFromShoppingList={removeFromShoppingList}
        shoppingCart
        items={inventoryItems.filter(
          (item) => item.NeedRestock && item.TargetQty > item.QtyOnHand,
        )}
      />
      <ToolSection id="filter" title="Filter & Sort">
        <FilterBarForm />
      </ToolSection>
    </main>
  );
}

export default MainContainer;
