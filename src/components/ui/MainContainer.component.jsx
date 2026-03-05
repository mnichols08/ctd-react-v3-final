import { useEffect, useState } from "react";
import inventorySampleData from "../../data/inventorySample.json";
import ToolSection from "../sections/ToolSection.component";
import QuickStatsBar from "./QuickStatsBar.component";
import AddInventoryItemForm from "../forms/AddInventoryItemForm.component";
import QuickAddForm from "../forms/QuickAddForm.component";
import InventorySection from "../sections/InventorySection.component";
import FilterBarForm from "../forms/FilterBarForm.component";

// Searchable fields for filtering inventory items
const SEARCHABLE_FIELDS = ["ItemName", "Brand", "Category", "Tags", "Notes"];

function MainContainer({ visibleFields, setArchivedItemsExist = () => {} }) {
  // Initialize inventory items from sample data, ensuring we have a fresh copy of each item
  const [inventoryItems, setInventoryItems] = useState(() =>
    inventorySampleData.records.map((item) => ({ ...item })),
  );
  // State to toggle between Quick Add and Full Form
  const [showQuickAdd, setShowQuickAdd] = useState(true);
  // Search term state (updated via debounced callback from FilterBarForm)
  const [searchTerm, setSearchTerm] = useState("");
  // Sorting state (default to sorting by ItemName)
  const [sortField, setSortField] = useState("ItemName");
  // Sort direction state (asc default, can be toggled to desc)
  const [sortDirection, setSortDirection] = useState("asc");

  // Filter inventory items by search term across searchable fields (case-insensitive, null-safe)
  const term = searchTerm.trim().toLowerCase();
  const filteredItems = term
    ? inventoryItems.filter((item) =>
        SEARCHABLE_FIELDS.some((field) => {
          const value = item[field];
          if (value == null) return false;
          return String(value).toLowerCase().includes(term);
        }),
      )
    : inventoryItems;
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
  // Handler to remove an item from the shopping list (mark as not NeedRestock and reset TargetQty to QtyOnHand)
  const removeFromShoppingList = (itemId) => {
    setInventoryItems((prevItems) =>
      prevItems.map((i) =>
        i.id === itemId
          ? { ...i, NeedRestock: false, TargetQty: i.QtyOnHand }
          : i,
      ),
    );
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

  // Handler to archive an item (mark as Status: "archived" and remove from shopping list)
  const archiveItem = (itemId) => {
    setInventoryItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== itemId || item.Status === "archived") return item;
        return {
          ...item,
          Status: "archived",
          NeedRestock: false,
          LastUpdated: new Date().toISOString(),
        };
      }),
    );
  };

  // Handler to unarchive an item (mark as Status: "active")
  const unarchiveItem = (itemId) => {
    setInventoryItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== itemId || item.Status !== "archived") return item;
        return {
          ...item,
          Status: "active",
          LastUpdated: new Date().toISOString(),
        };
      }),
    );
  };

  // Handler to delete an item permanently from the inventory
  const deleteItem = (itemId) => {
    setInventoryItems((prevItems) =>
      prevItems.filter((item) => item.id !== itemId),
    );
  };

  // Handler to update sort field and direction (sorting is derived, not mutated)
  const handleSort = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
  };

  // Fields that should use locale-aware string comparison
  const STRING_SORT_FIELDS = ["ItemName", "Category"];
  // Fields that should use numeric comparison
  const NUMERIC_SORT_FIELDS = ["QtyOnHand"];
  // Fields that should use date comparison (nulls sort to end)
  const DATE_SORT_FIELDS = ["ExpiresOn", "LastUpdated"];

  // Sort filtered items by the selected field and direction
  const sortedItems = sortField
    ? [...filteredItems].sort((a, b) => {
        const aValue = a[sortField] ?? "";
        const bValue = b[sortField] ?? "";
        const dir = sortDirection === "asc" ? 1 : -1;
        if (STRING_SORT_FIELDS.includes(sortField)) {
          return String(aValue).localeCompare(String(bValue)) * dir;
        }
        if (NUMERIC_SORT_FIELDS.includes(sortField)) {
          return (Number(aValue) - Number(bValue)) * dir;
        }
        if (DATE_SORT_FIELDS.includes(sortField)) {
          const aEmpty = !aValue;
          const bEmpty = !bValue;
          if (aEmpty && bEmpty) return 0;
          if (aEmpty) return 1;
          if (bEmpty) return -1;
          const aTime = new Date(aValue).getTime();
          const bTime = new Date(bValue).getTime();
          return (aTime - bTime) * dir;
        }
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      })
    : filteredItems;

  // Effect to check for archived items whenever the inventory changes and update the state in App accordingly
  useEffect(() => {
    setArchivedItemsExist(
      inventoryItems.some((item) => item.Status === "archived"),
    );
  }, [inventoryItems, setArchivedItemsExist]);

  return (
    <main>
      <ToolSection id="stats" title="Quick Stats">
        <QuickStatsBar inventoryItems={inventoryItems} />
      </ToolSection>
      <ToolSection id="filter" title="Filter & Sort">
        <FilterBarForm
          onSearch={setSearchTerm}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
        />
        {searchTerm.trim() && (
          <p>
            Showing {filteredItems.length} of {inventoryItems.length} items
          </p>
        )}
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
        removeFromShoppingList={removeFromShoppingList}
        updateItem={updateInventoryItem}
        visibleFields={visibleFields}
        items={sortedItems.filter(
          (item) =>
            item.Location.includes("Fridge") && item.Status !== "archived",
        )}
        archiveItem={archiveItem}
        deleteItem={deleteItem}
      />
      <InventorySection
        id="freezer"
        title="Freezer"
        addToShoppingList={addToShoppingList}
        removeFromShoppingList={removeFromShoppingList}
        updateItem={updateInventoryItem}
        visibleFields={visibleFields}
        items={sortedItems.filter(
          (item) =>
            item.Location.includes("Freezer") && item.Status !== "archived",
        )}
        archiveItem={archiveItem}
        deleteItem={deleteItem}
      />
      <InventorySection
        id="pantry"
        title="Pantry"
        addToShoppingList={addToShoppingList}
        removeFromShoppingList={removeFromShoppingList}
        updateItem={updateInventoryItem}
        visibleFields={visibleFields}
        items={sortedItems.filter(
          (item) =>
            item.Location.includes("Pantry") && item.Status !== "archived",
        )}
        archiveItem={archiveItem}
        deleteItem={deleteItem}
      />
      {/* Render Shopping List based upon NeedRestock and TargetQty vs QtyOnHand */}
      <InventorySection
        id="shopping-list"
        title="Shopping List"
        updateItemQuantity={updateItemQuantity}
        items={sortedItems.filter(
          (item) => item.NeedRestock && item.TargetQty > item.QtyOnHand,
        )}
      />
      {/* Archived Items Section */}
      {inventoryItems.some((item) => item.Status === "archived") && (
        <InventorySection
          id="archived"
          title="Archived Items"
          items={sortedItems.filter((item) => item.Status === "archived")}
          unarchiveItem={unarchiveItem}
          deleteItem={deleteItem}
        />
      )}
    </main>
  );
}

export default MainContainer;
