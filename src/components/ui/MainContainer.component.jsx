import { useState } from "react";
import inventorySampleData from "../../data/inventorySample.json";
import ToolSection from "../sections/ToolSection.component";
import QuickStatsBar from "./QuickStatsBar.component";
import AddInventoryItemForm from "../forms/AddInventoryItemForm.component";
import QuickAddForm from "../forms/QuickAddForm.component";
import InventorySection from "../sections/InventorySection.component";
import FilterBarForm from "../forms/FilterBarForm.component";

function MainContainer({ visibleFields }) {
  // Initialize inventory items from sample data, ensuring we have a fresh copy of each item
  const [inventoryItems, setInventoryItems] = useState(() =>
    inventorySampleData.records.map((item) => ({ ...item })),
  );
  // State to toggle between Quick Add and Full Form
  const [showQuickAdd, setShowQuickAdd] = useState(true);
  // Handler to add a new inventory item
  const addInventoryItem = (newItem) => {
    setInventoryItems((prevItems) => [...prevItems, newItem]);
  };
  // Handler to add an item to the shopping list (mark as NeedRestock and update TargetQty)
  const addToShoppingList = ({ itemId, quantity }) => {
    setInventoryItems((prevItems) => {
      const item = prevItems.find((i) => i.id === itemId);
      if (!item) {
        return prevItems;
      }
      const qty = Number(quantity);
      if (!Number.isFinite(qty)) return prevItems;
      const updatedItem = {
        ...item,
        NeedRestock: true,
        TargetQty: item.QtyOnHand + qty,
      };
      return prevItems.map((i) => (i.id === itemId ? updatedItem : i));
    });
  };
  // Handler to update the TargetQty for a shopping-list item.
  // Automatically removes from shopping list when newTargetQty <= QtyOnHand.
  const updateItemQuantity = (itemId, newTargetQty) => {
    setInventoryItems((prevItems) => {
      const item = prevItems.find((i) => i.id === itemId);
      if (!item) return prevItems;
      const qty = Number(newTargetQty);
      if (!Number.isFinite(qty)) return prevItems;
      // If the new target is at or below what's on hand, remove from list
      if (qty <= item.QtyOnHand) {
        return prevItems.map((i) =>
          i.id === itemId
            ? { ...i, NeedRestock: false, TargetQty: i.QtyOnHand }
            : i,
        );
      }
      return prevItems.map((i) =>
        i.id === itemId ? { ...i, TargetQty: qty } : i,
      );
    });
  };
  // Handler to update an existing inventory item
  const updateInventoryItem = (updatedItem) => {
    setInventoryItems((prevItems) =>
      prevItems.map((i) => (i.id === updatedItem.id ? updatedItem : i)),
    );
  };
  return (
    <main>
      <ToolSection id="stats" title="Quick Stats">
        <QuickStatsBar />
      </ToolSection>
      <ToolSection id="add-item" title="Add Item">
        {/*  Toggle between Quick Add and Full Form */}
        <button onClick={() => setShowQuickAdd((prev) => !prev)}>
          {showQuickAdd ? "Switch to Full Form" : "Switch to Quick Add"}
        </button>
        {showQuickAdd ? (
          <QuickAddForm addInventoryItem={addInventoryItem} />
        ) : (
          <AddInventoryItemForm addInventoryItem={addInventoryItem} />
        )}
      </ToolSection>
      <InventorySection
        id="fridge"
        title="Fridge"
        addToShoppingList={addToShoppingList}
        updateItemQuantity={updateItemQuantity}
        updateItem={updateInventoryItem}
        visibleFields={visibleFields}
        items={inventoryItems.filter((item) =>
          item.Location.includes("Fridge"),
        )}
      />
      <InventorySection
        id="freezer"
        title="Freezer"
        addToShoppingList={addToShoppingList}
        updateItemQuantity={updateItemQuantity}
        updateItem={updateInventoryItem}
        visibleFields={visibleFields}
        items={inventoryItems.filter((item) =>
          item.Location.includes("Freezer"),
        )}
      />
      <InventorySection
        id="pantry"
        title="Pantry"
        addToShoppingList={addToShoppingList}
        updateItemQuantity={updateItemQuantity}
        updateItem={updateInventoryItem}
        visibleFields={visibleFields}
        items={inventoryItems.filter((item) =>
          item.Location.includes("Pantry"),
        )}
      />
      {/* Render Shopping List based upon NeedRestock and TargetQty vs QtyOnHand */}
      <InventorySection
        id="shopping-list"
        title="Shopping List"
        updateItemQuantity={updateItemQuantity}
        visibleFields={visibleFields}
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
