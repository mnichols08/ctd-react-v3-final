import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  createEvent,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";

import AddInventoryItemForm from "./AddInventoryItemForm.component";
import ShoppingListControl from "./ShoppingListControl.component";
import EditInventoryItemForm from "./EditInventoryItemForm.component";
import FilterBarForm from "./FilterBarForm.component";
import QuickAddForm from "./QuickAddForm.component";
import ItemCard from "../cards/ItemCard.component";
import ToolSection from "../sections/ToolSection.component";
import { DEFAULT_VISIBLE_FIELDS } from "../../data/fieldConfig";

afterEach(() => {
  cleanup();
});

describe("AddInventoryItemForm", () => {
  it("renders all form sections and submit action", () => {
    render(<AddInventoryItemForm addInventoryItem={() => {}} lastId={0} />);

    expect(
      screen.getByRole("form", { name: "Add Inventory Item" }),
    ).toBeTruthy();
    expect(screen.getByText("Basic Details")).toBeTruthy();
    expect(screen.getByText("Classification & Storage")).toBeTruthy();
    expect(screen.getByText("Quantities")).toBeTruthy();
    expect(screen.getByText("Dates")).toBeTruthy();
    expect(screen.getByText("Pricing & Purchase")).toBeTruthy();
    expect(screen.getByText("References & Notes")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Add Item" })).toBeTruthy();
  });

  it("marks key required fields as required", () => {
    render(<AddInventoryItemForm addInventoryItem={() => {}} lastId={0} />);

    expect(screen.getByLabelText("Item Name:").required).toBe(true);
    expect(screen.getByLabelText("Quantity on Hand:").required).toBe(true);
  });

  it("clears form and focuses Item Name input after successful submit", () => {
    const addInventoryItem = vi.fn();

    const { container } = render(
      <AddInventoryItemForm addInventoryItem={addInventoryItem} lastId={0} />,
    );

    const itemNameInput = screen.getByLabelText("Item Name:");
    const qtyInput = screen.getByLabelText("Quantity on Hand:");
    const locationSelect = screen.getByLabelText("Location:");

    fireEvent.change(itemNameInput, { target: { value: "Test Item" } });
    fireEvent.change(qtyInput, { target: { value: "5" } });
    fireEvent.change(locationSelect, { target: { value: "Pantry" } });

    expect(itemNameInput.value).toBe("Test Item");
    expect(qtyInput.value).toBe("5");

    const form = container.querySelector("form");
    const submitEvent = createEvent.submit(form);
    fireEvent(form, submitEvent);

    expect(addInventoryItem).toHaveBeenCalledTimes(1);
    expect(itemNameInput.value).toBe("");
    expect(qtyInput.value).toBe("");
    expect(document.activeElement).toBe(itemNameInput);
  });
});

describe("ShoppingListControl", () => {
  it("renders an Add to Shopping List button when item is not on the list", () => {
    const item = {
      id: 25,
      ItemName: "Rice",
      QtyOnHand: 2,
      TargetQty: 2,
      NeedRestock: false,
    };

    render(
      <ShoppingListControl item={item} handleAddToShoppingList={() => {}} />,
    );

    expect(
      screen.getByRole("button", { name: "Add to Shopping List" }),
    ).toBeTruthy();
  });

  it("calls handler with itemId and quantity of 1 when Add clicked", () => {
    const handleAdd = vi.fn();
    const item = {
      id: 25,
      ItemName: "Rice",
      QtyOnHand: 2,
      TargetQty: 2,
      NeedRestock: false,
    };

    render(
      <ShoppingListControl item={item} handleAddToShoppingList={handleAdd} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Add to Shopping List" }),
    );

    expect(handleAdd).toHaveBeenCalledTimes(1);
    expect(handleAdd).toHaveBeenCalledWith({
      itemId: 25,
      quantity: 1,
    });
  });

  it("does not throw when callback prop is missing", () => {
    const item = {
      id: 25,
      ItemName: "Rice",
      QtyOnHand: 2,
      TargetQty: 2,
      NeedRestock: false,
    };

    render(<ShoppingListControl item={item} />);

    expect(() => {
      fireEvent.click(
        screen.getByRole("button", { name: "Add to Shopping List" }),
      );
    }).not.toThrow();
  });

  it("shows stepper when item is on the shopping list", () => {
    const handleUpdateQty = vi.fn();
    const item = {
      id: 10,
      ItemName: "Sesame Oil",
      QtyOnHand: 1,
      TargetQty: 3,
      NeedRestock: true,
    };

    render(
      <ShoppingListControl
        item={item}
        handleUpdateItemQuantity={handleUpdateQty}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Add to Shopping List" }),
    ).toBeNull();

    expect(screen.getByText("2")).toBeTruthy();

    const decBtn = screen.getByRole("button", { name: /decrease quantity/i });
    const incBtn = screen.getByRole("button", { name: /increase quantity/i });

    fireEvent.click(incBtn);
    expect(handleUpdateQty).toHaveBeenCalledWith(10, 4);

    fireEvent.click(decBtn);
    expect(handleUpdateQty).toHaveBeenCalledWith(10, 2);
  });
});

describe("FilterBar", () => {
  it("renders search, sort, and filter controls", () => {
    render(<FilterBarForm />);

    expect(screen.getByLabelText("Search:")).toBeTruthy();
    expect(screen.getByLabelText("Sort by:")).toBeTruthy();
    expect(screen.getByLabelText("Filter by:")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Apply Filter" })).toBeTruthy();
  });

  it("includes expected option sets for sort and filter", () => {
    render(<FilterBarForm />);

    const sortOptions = screen
      .getAllByRole("option")
      .map((option) => option.textContent);

    expect(sortOptions).toContain("Name");
    expect(sortOptions).toContain("Expiration Date");
    expect(sortOptions).toContain("Purchase Date");
    expect(sortOptions).toContain("Quantity");
    expect(sortOptions).toContain("All Items");
    expect(sortOptions).toContain("Expiring Soon");
    expect(sortOptions).toContain("Low Stock");
    expect(sortOptions).toContain("Categories");
  });
});

describe("Form submission behavior", () => {
  it("prevents default submit action for all forms", () => {
    const formRenderers = [
      () =>
        render(<AddInventoryItemForm addInventoryItem={() => {}} lastId={0} />),
      () => render(<FilterBarForm />),
    ];

    formRenderers.forEach((renderForm) => {
      const { container, unmount } = renderForm();
      const form = container.querySelector("form");

      expect(form).toBeTruthy();

      if (!form) {
        return;
      }

      const submitEvent = createEvent.submit(form);
      fireEvent(form, submitEvent);

      expect(submitEvent.defaultPrevented).toBe(true);
      unmount();
    });
  });
});

describe("ItemCard", () => {
  // A visibleFields set that includes every field the old tests relied on
  const allTestFields = new Set([
    ...DEFAULT_VISIBLE_FIELDS,
    "DateFrozen",
    "Notes",
  ]);

  it("renders mapped inventory fields", () => {
    const item = {
      id: 1,
      ItemName: "Blueberries",
      QtyOnHand: "2",
      QtyUnit: "bags",
      ExpiresOn: "2026-04-10",
      DateFrozen: "2026-03-01",
      Notes: "Use for smoothies",
      Category: "Fruit",
    };

    render(
      <ItemCard
        item={item}
        visibleFields={allTestFields}
        handleUpdateItem={() => {}}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Blueberries", level: 2 }),
    ).toBeTruthy();
    expect(screen.getByText("Qty on Hand: 2")).toBeTruthy();
    expect(screen.getByText("Qty Unit: bags")).toBeTruthy();
    expect(screen.getByText("Expires On: 2026-04-10")).toBeTruthy();
    expect(screen.getByText("Date Frozen: 2026-03-01")).toBeTruthy();
    expect(screen.getByText("Notes: Use for smoothies")).toBeTruthy();
    expect(screen.getByText("Category: Fruit")).toBeTruthy();
  });

  it("omits optional lines when frozen date and notes are absent", () => {
    const item = {
      id: 2,
      ItemName: "Milk",
      QtyOnHand: "1",
      QtyUnit: "carton",
      ExpirationDate: "2026-03-20",
      Category: "Dairy",
    };

    render(
      <ItemCard
        item={item}
        handleAddToShoppingList={() => {}}
        visibleFields={allTestFields}
      />,
    );

    expect(screen.queryByText(/Date Frozen:/)).toBeNull();
    expect(screen.queryByText(/Notes:/)).toBeNull();

    const listItem = screen.getByRole("listitem");
    expect(
      within(listItem).getByRole("heading", { name: "Milk" }),
    ).toBeTruthy();

    expect(
      within(listItem).getByRole("button", { name: "Add to Shopping List" }),
    ).toBeTruthy();
  });

  it("shows quantity stepper and hides add button for shopping list items", () => {
    const handleUpdateQty = vi.fn();
    const item = {
      id: 3,
      ItemName: "Sesame Oil",
      QtyOnHand: 0.1,
      QtyUnit: "bottle",
      TargetQty: 1,
      NeedRestock: true,
      ExpiresOn: "2026-10-01",
      Category: "Cooking Essentials",
    };

    render(<ItemCard item={item} handleUpdateItemQuantity={handleUpdateQty} />);

    // With TargetQty 1 and QtyOnHand 0.1, decrementing would remove from list
    const removeBtn = screen.getByRole("button", {
      name: /remove from/i,
    });
    const incrementBtn = screen.getByRole("button", {
      name: /increase quantity/i,
    });
    expect(removeBtn).toBeTruthy();
    expect(incrementBtn).toBeTruthy();

    // Current TargetQty should be displayed
    expect(screen.getByText("1")).toBeTruthy();

    // Add button should not be shown
    expect(
      screen.queryByRole("button", { name: "Add to Shopping List" }),
    ).toBeNull();

    // Clicking + should call handler with incremented qty
    fireEvent.click(incrementBtn);
    expect(handleUpdateQty).toHaveBeenCalledWith(3, 2);

    // Clicking Remove should call handler with decremented qty (triggers removal)
    fireEvent.click(removeBtn);
    expect(handleUpdateQty).toHaveBeenCalledWith(3, 0);
  });

  it("shows stepper instead of add button when item is already in the shopping list", () => {
    const handleUpdateQty = vi.fn();
    const item = {
      id: 4,
      ItemName: "Pearl Couscous",
      QtyOnHand: 1,
      QtyUnit: "container",
      TargetQty: 3,
      NeedRestock: true,
      ExpiresOn: "2027-03-12",
      Category: "Dry",
    };

    render(
      <ItemCard
        item={item}
        handleAddToShoppingList={() => {}}
        handleUpdateItemQuantity={handleUpdateQty}
      />,
    );

    // Add button should not be shown
    expect(
      screen.queryByRole("button", { name: "Add to Shopping List" }),
    ).toBeNull();

    // Stepper should be shown with current Qty in Cart
    expect(screen.getByText("2")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /decrease quantity/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /increase quantity/i }),
    ).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// QuickAddForm – unit tests
// ---------------------------------------------------------------------------
describe("QuickAddForm", () => {
  it("renders all 5 input fields", () => {
    render(<QuickAddForm addInventoryItem={() => {}} />);

    expect(screen.getByLabelText("Item Name:")).toBeTruthy();
    expect(screen.getByLabelText("Category:")).toBeTruthy();
    expect(screen.getByLabelText("Location:")).toBeTruthy();
    expect(screen.getByLabelText("Quantity on Hand:")).toBeTruthy();
    expect(screen.getByLabelText("Unit:")).toBeTruthy();
  });

  it("submitting with valid data calls addInventoryItem with correct payload shape", () => {
    const addInventoryItem = vi.fn();

    const { container } = render(
      <QuickAddForm addInventoryItem={addInventoryItem} />,
    );

    fireEvent.change(screen.getByLabelText("Item Name:"), {
      target: { value: "Oat Milk" },
    });
    fireEvent.change(screen.getByLabelText("Category:"), {
      target: { value: "Dairy" },
    });
    fireEvent.change(screen.getByLabelText("Location:"), {
      target: { value: "Fridge" },
    });
    fireEvent.change(screen.getByLabelText("Quantity on Hand:"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("Unit:"), {
      target: { value: "cartons" },
    });

    const form = container.querySelector("form");
    const submitEvent = createEvent.submit(form);
    fireEvent(form, submitEvent);

    expect(addInventoryItem).toHaveBeenCalledTimes(1);

    const payload = addInventoryItem.mock.calls[0][0];
    // Verify key user-entered values
    expect(payload.ItemName).toBe("Oat Milk");
    expect(payload.Category).toBe("Dairy");
    expect(payload.Location).toBe("Fridge");
    expect(payload.QtyOnHand).toBe(3);
    expect(payload.QtyUnit).toBe("cartons");

    // Verify all expected keys are present (26 fields total)
    const expectedKeys = [
      "id",
      "ItemName",
      "ItemDescripton",
      "Brand",
      "PackageSize",
      "UPC",
      "Category",
      "SubCategory",
      "Location",
      "QtyOnHand",
      "QtyUnit",
      "TargetQty",
      "NeedRestock",
      "ExpiresOn",
      "DatePurchased",
      "DateFrozen",
      "PurchasePrice",
      "Store",
      "UnitCost",
      "Notes",
      "Tags",
      "Allergens",
      "ImageRef",
      "Status",
      "ProductUrl",
      "LastUpdated",
    ];
    expectedKeys.forEach((key) => {
      expect(payload).toHaveProperty(key);
    });
  });

  it("submitting with empty ItemName does not call addInventoryItem", () => {
    const addInventoryItem = vi.fn();

    const { container } = render(
      <QuickAddForm addInventoryItem={addInventoryItem} />,
    );

    // Leave ItemName empty, fill others
    fireEvent.change(screen.getByLabelText("Category:"), {
      target: { value: "Dairy" },
    });
    fireEvent.change(screen.getByLabelText("Location:"), {
      target: { value: "Fridge" },
    });
    fireEvent.change(screen.getByLabelText("Quantity on Hand:"), {
      target: { value: "1" },
    });

    const form = container.querySelector("form");
    const submitEvent = createEvent.submit(form);
    fireEvent(form, submitEvent);

    expect(addInventoryItem).not.toHaveBeenCalled();
  });

  it("form resets after successful submit", () => {
    const addInventoryItem = vi.fn();

    const { container } = render(
      <QuickAddForm addInventoryItem={addInventoryItem} />,
    );

    const itemNameInput = screen.getByLabelText("Item Name:");
    const categorySelect = screen.getByLabelText("Category:");
    const locationSelect = screen.getByLabelText("Location:");
    const qtyInput = screen.getByLabelText("Quantity on Hand:");

    fireEvent.change(itemNameInput, { target: { value: "Rice" } });
    fireEvent.change(categorySelect, { target: { value: "Dry" } });
    fireEvent.change(locationSelect, { target: { value: "Pantry" } });
    fireEvent.change(qtyInput, { target: { value: "5" } });

    const form = container.querySelector("form");
    fireEvent(form, createEvent.submit(form));

    expect(addInventoryItem).toHaveBeenCalledTimes(1);
    // After submit the form should reset
    expect(itemNameInput.value).toBe("");
    expect(qtyInput.value).toBe("");
    // Focus returns to ItemName
    expect(document.activeElement).toBe(itemNameInput);
  });

  it("default values are set correctly for non-required fields", () => {
    const addInventoryItem = vi.fn();

    const { container } = render(
      <QuickAddForm addInventoryItem={addInventoryItem} />,
    );

    fireEvent.change(screen.getByLabelText("Item Name:"), {
      target: { value: "Butter" },
    });
    fireEvent.change(screen.getByLabelText("Category:"), {
      target: { value: "Dairy" },
    });
    fireEvent.change(screen.getByLabelText("Location:"), {
      target: { value: "Fridge" },
    });
    fireEvent.change(screen.getByLabelText("Quantity on Hand:"), {
      target: { value: "2" },
    });

    const form = container.querySelector("form");
    fireEvent(form, createEvent.submit(form));

    const payload = addInventoryItem.mock.calls[0][0];

    // Non-required fields should have sensible defaults
    expect(payload.TargetQty).toBe(0);
    expect(payload.NeedRestock).toBe(false);
    expect(payload.SubCategory).toBeNull();
    expect(payload.Brand).toBeNull();
    expect(payload.ExpiresOn).toBeNull();
    expect(payload.DatePurchased).toBeNull();
    expect(payload.DateFrozen).toBeNull();
    expect(payload.PurchasePrice).toBeNull();
    expect(payload.Store).toBeNull();
    expect(payload.UnitCost).toBeNull();
    expect(payload.Notes).toBeNull();
    expect(payload.Tags).toBeNull();
    expect(payload.Allergens).toBeNull();
    expect(payload.ImageRef).toBeNull();
    expect(payload.Status).toBeNull();
    expect(payload.ProductUrl).toBeNull();
    expect(typeof payload.LastUpdated).toBe("string");
  });
});

// ---------------------------------------------------------------------------
// EditInventoryItemForm – unit tests
// ---------------------------------------------------------------------------
describe("EditInventoryItemForm", () => {
  const baseItem = {
    id: 10,
    ItemName: "Blueberries",
    ItemDescripton: "Organic",
    Brand: "Nature's Best",
    PackageSize: "16oz",
    UPC: "123456789",
    Category: "Fruit",
    SubCategory: "Berries",
    Location: "Freezer",
    QtyOnHand: 2,
    QtyUnit: "bags",
    TargetQty: 5,
    NeedRestock: true,
    ExpiresOn: "2026-06-01",
    DatePurchased: "2026-02-15",
    DateFrozen: "2026-02-16",
    PurchasePrice: 4.99,
    Store: "Whole Foods",
    UnitCost: null,
    Notes: "Use for smoothies",
    Tags: "organic,frozen",
    Allergens: null,
    ImageRef: null,
    Status: "Active",
    ProductUrl: null,
    LastUpdated: "2026-02-15T12:00:00.000Z",
  };

  it("renders with all fields pre-populated from the item prop", () => {
    render(
      <EditInventoryItemForm
        item={baseItem}
        onSave={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(screen.getByLabelText("Item Name:").value).toBe("Blueberries");
    expect(screen.getByLabelText("Item Description:").value).toBe("Organic");
    expect(screen.getByLabelText("Brand:").value).toBe("Nature's Best");
    expect(screen.getByLabelText("Package Size:").value).toBe("16oz");
    expect(screen.getByLabelText("UPC:").value).toBe("123456789");
    expect(screen.getByLabelText("Category:").value).toBe("Fruit");
    expect(screen.getByLabelText("Sub Category:").value).toBe("Berries");
    expect(screen.getByLabelText("Location:").value).toBe("Freezer");
    expect(screen.getByLabelText("Quantity on Hand:").value).toBe("2");
    expect(screen.getByLabelText("Unit:").value).toBe("bags");
    expect(screen.getByLabelText("Target Qty:").value).toBe("5");
    expect(screen.getByLabelText("Expires On:").value).toBe("2026-06-01");
    expect(screen.getByLabelText("Date Purchased:").value).toBe("2026-02-15");
    expect(screen.getByLabelText("Purchase Price:").value).toBe("4.99");
    expect(screen.getByLabelText("Store:").value).toBe("Whole Foods");
    expect(screen.getByLabelText("Notes:").value).toBe("Use for smoothies");
  });

  it("null fields render as empty inputs", () => {
    const itemWithNulls = {
      ...baseItem,
      Brand: null,
      UPC: null,
      SubCategory: null,
      Allergens: null,
      Store: null,
      Notes: null,
    };

    render(
      <EditInventoryItemForm
        item={itemWithNulls}
        onSave={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(screen.getByLabelText("Brand:").value).toBe("");
    expect(screen.getByLabelText("UPC:").value).toBe("");
    expect(screen.getByLabelText("Sub Category:").value).toBe("");
    expect(screen.getByLabelText("Allergens:").value).toBe("");
    expect(screen.getByLabelText("Store:").value).toBe("");
    expect(screen.getByLabelText("Notes:").value).toBe("");
  });

  it("modifying a field and saving calls onSave with the updated value", () => {
    const onSave = vi.fn();

    const { container } = render(
      <EditInventoryItemForm
        item={baseItem}
        onSave={onSave}
        onCancel={() => {}}
      />,
    );

    const nameInput = screen.getByLabelText("Item Name:");
    fireEvent.change(nameInput, { target: { value: "Raspberries" } });

    const form = container.querySelector("form");
    fireEvent(form, createEvent.submit(form));

    expect(onSave).toHaveBeenCalledTimes(1);

    const saved = onSave.mock.calls[0][0];
    expect(saved.ItemName).toBe("Raspberries");
    // Other unchanged fields should still be present
    expect(saved.id).toBe(10);
    expect(saved.Category).toBe("Fruit");
  });

  it("Cancel calls onCancel without modifying the item", () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(
      <EditInventoryItemForm
        item={baseItem}
        onSave={onSave}
        onCancel={onCancel}
      />,
    );

    // Modify a field first
    fireEvent.change(screen.getByLabelText("Item Name:"), {
      target: { value: "Changed" },
    });

    // Click cancel
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("LastUpdated is auto-set to current timestamp on save", () => {
    const onSave = vi.fn();
    const before = new Date().toISOString();

    const { container } = render(
      <EditInventoryItemForm
        item={baseItem}
        onSave={onSave}
        onCancel={() => {}}
      />,
    );

    const form = container.querySelector("form");
    fireEvent(form, createEvent.submit(form));

    const after = new Date().toISOString();
    const saved = onSave.mock.calls[0][0];

    // LastUpdated should be an ISO timestamp between before and after
    expect(saved.LastUpdated).not.toBe(baseItem.LastUpdated);
    expect(saved.LastUpdated >= before).toBe(true);
    expect(saved.LastUpdated <= after).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Integration tests
// ---------------------------------------------------------------------------
describe("Integration: QuickAddForm in ToolSection", () => {
  it("renders within ToolSection and submits successfully", () => {
    const addInventoryItem = vi.fn();

    const { container } = render(
      <ToolSection id="quick-add" title="Quick Add">
        <QuickAddForm addInventoryItem={addInventoryItem} />
      </ToolSection>,
    );

    // Verify the form is nested inside the section
    const section = container.querySelector("section#quick-add");
    expect(section).toBeTruthy();
    expect(
      within(section).getByRole("heading", { name: "Quick Add" }),
    ).toBeTruthy();

    // Fill and submit
    fireEvent.change(within(section).getByLabelText("Item Name:"), {
      target: { value: "Almonds" },
    });
    fireEvent.change(within(section).getByLabelText("Category:"), {
      target: { value: "Snacks" },
    });
    fireEvent.change(within(section).getByLabelText("Location:"), {
      target: { value: "Pantry" },
    });
    fireEvent.change(within(section).getByLabelText("Quantity on Hand:"), {
      target: { value: "4" },
    });

    const form = section.querySelector("form");
    fireEvent(form, createEvent.submit(form));

    expect(addInventoryItem).toHaveBeenCalledTimes(1);
    expect(addInventoryItem.mock.calls[0][0].ItemName).toBe("Almonds");
  });
});

describe("Integration: EditInventoryItemForm in ItemCard", () => {
  const editableItem = {
    id: 50,
    ItemName: "Cheddar Cheese",
    QtyOnHand: 3,
    QtyUnit: "blocks",
    TargetQty: 5,
    NeedRestock: false,
    ExpiresOn: "2026-05-20",
    DateFrozen: null,
    Notes: "Sharp cheddar",
    Category: "Dairy",
    ItemDescripton: null,
    Brand: null,
    PackageSize: null,
    UPC: null,
    SubCategory: null,
    Location: "Fridge",
    DatePurchased: null,
    PurchasePrice: null,
    Store: null,
    UnitCost: null,
    Tags: null,
    Allergens: null,
    ImageRef: null,
    Status: null,
    ProductUrl: null,
    LastUpdated: "2026-01-01T00:00:00.000Z",
  };

  it("renders EditInventoryItemForm inside ItemCard when Edit is clicked", () => {
    const handleUpdateItem = vi.fn();

    render(
      <ItemCard
        item={editableItem}
        handleAddToShoppingList={() => {}}
        handleUpdateItem={handleUpdateItem}
      />,
    );

    // Initially the edit form should not be visible
    expect(
      screen.queryByRole("form", { name: "Edit Inventory Item" }),
    ).toBeNull();

    // Click Edit
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    // Now the edit form should be visible
    expect(
      screen.getByRole("form", { name: "Edit Inventory Item" }),
    ).toBeTruthy();

    // The card heading should be replaced by the form
    expect(
      screen.queryByRole("heading", { name: "Cheddar Cheese", level: 2 }),
    ).toBeNull();
  });

  it("editing an item in ItemCard updates the rendered card content", () => {
    let currentItem = { ...editableItem };
    const handleUpdateItem = vi.fn((updatedItem) => {
      currentItem = updatedItem;
    });

    const { rerender } = render(
      <ItemCard
        item={currentItem}
        handleAddToShoppingList={() => {}}
        handleUpdateItem={handleUpdateItem}
      />,
    );

    // Click Edit
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    // Change the item name
    const nameInput = screen.getByLabelText("Item Name:");
    fireEvent.change(nameInput, { target: { value: "Gouda Cheese" } });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(handleUpdateItem).toHaveBeenCalledTimes(1);
    expect(handleUpdateItem.mock.calls[0][0].ItemName).toBe("Gouda Cheese");

    // Rerender with the updated item (simulating parent state update)
    rerender(
      <ItemCard
        item={currentItem}
        handleAddToShoppingList={() => {}}
        handleUpdateItem={handleUpdateItem}
      />,
    );

    // The card should now show the updated name
    expect(
      screen.getByRole("heading", { name: "Gouda Cheese", level: 2 }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "Cheddar Cheese" }),
    ).toBeNull();
  });
});
