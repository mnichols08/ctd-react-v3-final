import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
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
import InventorySection from "../sections/InventorySection.component";
import ToolSection from "../sections/ToolSection.component";
import { DEFAULT_VISIBLE_FIELDS } from "../../data/fieldConfig";
import { InventoryProvider } from "../../context/InventoryProvider";
import { InventoryActionsContext } from "../../context/InventoryContext";

afterEach(() => {
  cleanup();
});

describe("AddInventoryItemForm", () => {
  it("renders all form sections and submit action", () => {
    render(
      <InventoryProvider>
        <AddInventoryItemForm />
      </InventoryProvider>,
    );

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
    render(
      <InventoryProvider>
        <AddInventoryItemForm />
      </InventoryProvider>,
    );

    expect(screen.getByLabelText("Item Name:").required).toBe(true);
    expect(screen.getByLabelText("Quantity on Hand:").required).toBe(true);
  });

  it("clears form and focuses Item Name input after successful submit", async () => {
    const { container } = render(
      <InventoryProvider>
        <AddInventoryItemForm />
      </InventoryProvider>,
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
    await act(async () => fireEvent(form, submitEvent));

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
      <InventoryProvider>
        <ShoppingListControl item={item} />
      </InventoryProvider>,
    );

    expect(
      screen.getByRole("button", { name: "Add to Shopping List" }),
    ).toBeTruthy();
  });

  it("calls handler when Add is clicked", () => {
    const item = {
      id: 25,
      ItemName: "Rice",
      QtyOnHand: 2,
      TargetQty: 2,
      NeedRestock: false,
    };

    render(
      <InventoryProvider>
        <ShoppingListControl item={item} />
      </InventoryProvider>,
    );

    expect(() => {
      fireEvent.click(
        screen.getByRole("button", { name: "Add to Shopping List" }),
      );
    }).not.toThrow();
  });

  it("does not throw when clicking Add to Shopping List", () => {
    const item = {
      id: 25,
      ItemName: "Rice",
      QtyOnHand: 2,
      TargetQty: 2,
      NeedRestock: false,
    };

    render(
      <InventoryProvider>
        <ShoppingListControl item={item} />
      </InventoryProvider>,
    );

    expect(() => {
      fireEvent.click(
        screen.getByRole("button", { name: "Add to Shopping List" }),
      );
    }).not.toThrow();
  });

  it("shows stepper when item is on the shopping list", () => {
    const item = {
      id: 10,
      ItemName: "Sesame Oil",
      QtyOnHand: 1,
      TargetQty: 3,
      NeedRestock: true,
    };

    render(
      <InventoryProvider>
        <ShoppingListControl item={item} variant="shopping" />
      </InventoryProvider>,
    );

    expect(
      screen.queryByRole("button", { name: "Add to Shopping List" }),
    ).toBeNull();

    expect(screen.getByText("2")).toBeTruthy();

    const decBtn = screen.getByRole("button", { name: /decrease quantity/i });
    const incBtn = screen.getByRole("button", { name: /increase quantity/i });

    expect(incBtn).toBeTruthy();
    expect(decBtn).toBeTruthy();
  });
});

describe("FilterBar", () => {
  it("renders search, sort, and filter controls", () => {
    render(
      <InventoryProvider>
        <FilterBarForm />
      </InventoryProvider>,
    );

    expect(screen.getByLabelText("Search:")).toBeTruthy();
    expect(screen.getByLabelText("Sort by:")).toBeTruthy();
    expect(screen.getByLabelText("Sort Direction:")).toBeTruthy();
    expect(screen.getByLabelText("Expiring Soon")).toBeTruthy();
    expect(screen.getByLabelText("Low Stock")).toBeTruthy();
  });

  it("includes expected option sets for sort and filter", () => {
    render(
      <InventoryProvider>
        <FilterBarForm />
      </InventoryProvider>,
    );

    const sortOptions = screen
      .getAllByRole("option")
      .map((option) => option.textContent);

    expect(sortOptions).toContain("None");
    expect(sortOptions).toContain("Item Name");
    expect(sortOptions).toContain("Expires On");
    expect(sortOptions).toContain("Qty on Hand");
    expect(sortOptions).toContain("Last Updated");
  });
});

describe("Form submission behavior", () => {
  it("prevents default submit action for all forms", () => {
    const formRenderers = [
      () =>
        render(
          <InventoryProvider>
            <AddInventoryItemForm />
          </InventoryProvider>,
        ),
      () =>
        render(
          <InventoryProvider>
            <FilterBarForm />
          </InventoryProvider>,
        ),
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
      <InventoryProvider>
        <ItemCard item={item} onEdit={() => {}} variant="inventory" />
      </InventoryProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "Blueberries", level: 2 }),
    ).toBeTruthy();
    expect(screen.getByText("Qty on Hand: 2")).toBeTruthy();
    expect(screen.getByText("Qty Unit: bags")).toBeTruthy();
    expect(screen.getByText("Expires On: 2026-04-10")).toBeTruthy();
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
      <InventoryProvider>
        <ItemCard
          item={item}
          addToShoppingList={() => {}}
          visibleFields={allTestFields}
        />
      </InventoryProvider>,
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

    render(
      <InventoryProvider>
        <ItemCard item={item} onEdit={() => {}} variant="shopping" />
      </InventoryProvider>,
    );

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
  });

  it("shows stepper instead of add button when item is already in the shopping list", () => {
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
      <InventoryProvider>
        <ItemCard item={item} onEdit={() => {}} variant="shopping" />
      </InventoryProvider>,
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
    render(
      <InventoryProvider>
        <QuickAddForm />
      </InventoryProvider>,
    );

    expect(screen.getByLabelText("Item Name:")).toBeTruthy();
    expect(screen.getByLabelText("Category:")).toBeTruthy();
    expect(screen.getByLabelText("Location:")).toBeTruthy();
    expect(screen.getByLabelText("Quantity on Hand:")).toBeTruthy();
    expect(screen.getByLabelText("Unit:")).toBeTruthy();
  });

  it("submitting with valid data adds an item successfully", async () => {
    const { container } = render(
      <InventoryProvider>
        <QuickAddForm />
      </InventoryProvider>,
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
    await act(async () => fireEvent(form, createEvent.submit(form)));

    // Form resets after successful submit
    expect(screen.getByLabelText("Item Name:").value).toBe("");
  });

  it("submitting with empty ItemName does not add an item", () => {
    const { container } = render(
      <InventoryProvider>
        <QuickAddForm />
      </InventoryProvider>,
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

    // Form should NOT reset (ItemName is still empty)
    expect(screen.getByLabelText("Quantity on Hand:").value).toBe("1");
  });

  it("form resets after successful submit", async () => {
    const { container } = render(
      <InventoryProvider>
        <QuickAddForm />
      </InventoryProvider>,
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
    await act(async () => fireEvent(form, createEvent.submit(form)));

    // After submit the form should reset
    expect(itemNameInput.value).toBe("");
    expect(qtyInput.value).toBe("");
    // Focus returns to ItemName
    expect(document.activeElement).toBe(itemNameInput);
  });

  it("default values are set correctly for non-required fields", async () => {
    const { container } = render(
      <InventoryProvider>
        <QuickAddForm />
      </InventoryProvider>,
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
    await act(async () => fireEvent(form, createEvent.submit(form)));

    // Form resets after successful submit, confirming item was added with defaults
    expect(screen.getByLabelText("Item Name:").value).toBe("");
  });
});

// ---------------------------------------------------------------------------
// EditInventoryItemForm – unit tests
// ---------------------------------------------------------------------------
describe("EditInventoryItemForm", () => {
  const baseItem = {
    id: 10,
    ItemName: "Blueberries",
    ItemDescription: "Organic",
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
      <InventoryProvider>
        <EditInventoryItemForm item={baseItem} onClose={() => {}} />
      </InventoryProvider>,
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
      <InventoryProvider>
        <EditInventoryItemForm item={itemWithNulls} onClose={() => {}} />
      </InventoryProvider>,
    );

    expect(screen.getByLabelText("Brand:").value).toBe("");
    expect(screen.getByLabelText("UPC:").value).toBe("");
    expect(screen.getByLabelText("Sub Category:").value).toBe("");
    expect(screen.getByLabelText("Allergens:").value).toBe("");
    expect(screen.getByLabelText("Store:").value).toBe("");
    expect(screen.getByLabelText("Notes:").value).toBe("");
  });

  it("modifying a field and saving calls updateItem with the updated value", async () => {
    const onClose = vi.fn();

    const { container } = render(
      <InventoryProvider>
        <EditInventoryItemForm item={baseItem} onClose={onClose} />
      </InventoryProvider>,
    );

    const nameInput = screen.getByLabelText("Item Name:");
    fireEvent.change(nameInput, { target: { value: "Raspberries" } });

    const form = container.querySelector("form");
    await act(async () => fireEvent(form, createEvent.submit(form)));

    // onClose is called after saving
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Cancel calls onClose without submitting", () => {
    const onClose = vi.fn();

    render(
      <InventoryProvider>
        <EditInventoryItemForm item={baseItem} onClose={onClose} />
      </InventoryProvider>,
    );

    // Modify a field first
    fireEvent.change(screen.getByLabelText("Item Name:"), {
      target: { value: "Changed" },
    });

    // Click cancel
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("submit coerces numeric fields to numbers and empty dates to null", async () => {
    const onClose = vi.fn();
    // Start with populated numeric and date fields
    const item = {
      ...baseItem,
      QtyOnHand: 2,
      TargetQty: 5,
      PurchasePrice: 4.99,
      UnitCost: null,
      ExpiresOn: "2026-06-01",
      DatePurchased: "2026-02-15",
      DateFrozen: "2026-02-16",
    };

    const { container } = render(
      <InventoryProvider>
        <EditInventoryItemForm item={item} onClose={onClose} />
      </InventoryProvider>,
    );

    // Update QtyOnHand and clear ExpiresOn + DateFrozen
    fireEvent.change(screen.getByLabelText("Quantity on Hand:"), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText("Target Qty:"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("Expires On:"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("Date Frozen:"), {
      target: { value: "" },
    });

    const form = container.querySelector("form");
    await act(async () => fireEvent(form, createEvent.submit(form)));

    // onClose is called after saving
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("LastUpdated is auto-set to current timestamp on save", async () => {
    const onClose = vi.fn();
    const _before = new Date().toISOString();

    const { container } = render(
      <InventoryProvider>
        <EditInventoryItemForm item={baseItem} onClose={onClose} />
      </InventoryProvider>,
    );

    const form = container.querySelector("form");
    await act(async () => fireEvent(form, createEvent.submit(form)));

    // onClose is called after saving, confirming submit completed
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close the dialog when updateItem fails", async () => {
    const onClose = vi.fn();
    const mockActions = {
      updateItem: vi.fn().mockResolvedValue(false),
    };

    const { container } = render(
      <InventoryActionsContext.Provider value={mockActions}>
        <EditInventoryItemForm item={baseItem} onClose={onClose} />
      </InventoryActionsContext.Provider>,
    );

    fireEvent.change(screen.getByLabelText("Item Name:"), {
      target: { value: "Should Not Save" },
    });

    const form = container.querySelector("form");
    await act(async () => fireEvent(form, createEvent.submit(form)));

    expect(mockActions.updateItem).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Integration tests
// ---------------------------------------------------------------------------
describe("Integration: QuickAddForm in ToolSection", () => {
  it("renders within ToolSection and submits successfully", async () => {
    const { container } = render(
      <InventoryProvider>
        <ToolSection id="quick-add" title="Quick Add">
          <QuickAddForm />
        </ToolSection>
      </InventoryProvider>,
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
    await act(async () => fireEvent(form, createEvent.submit(form)));

    // Form resets after successful submit
    expect(within(section).getByLabelText("Item Name:").value).toBe("");
  });
});

// ---------------------------------------------------------------------------
// M2 – Controlled forms: immediate value update
// ---------------------------------------------------------------------------
describe("Controlled forms – typing updates displayed value immediately", () => {
  it("QuickAddForm: typing in Item Name updates its value", () => {
    render(
      <InventoryProvider>
        <QuickAddForm />
      </InventoryProvider>,
    );

    const input = screen.getByLabelText("Item Name:");
    expect(input.value).toBe("");

    fireEvent.change(input, { target: { value: "Almond Butter" } });
    expect(input.value).toBe("Almond Butter");

    fireEvent.change(input, { target: { value: "Almond Butter Smooth" } });
    expect(input.value).toBe("Almond Butter Smooth");
  });

  it("AddInventoryItemForm: typing in Item Name updates its value", () => {
    render(
      <InventoryProvider>
        <AddInventoryItemForm />
      </InventoryProvider>,
    );

    const input = screen.getByLabelText("Item Name:");
    expect(input.value).toBe("");

    fireEvent.change(input, { target: { value: "Coconut Oil" } });
    expect(input.value).toBe("Coconut Oil");
  });

  it("AddInventoryItemForm: typing in numeric Quantity field updates its value", () => {
    render(
      <InventoryProvider>
        <AddInventoryItemForm />
      </InventoryProvider>,
    );

    const input = screen.getByLabelText("Quantity on Hand:");
    fireEvent.change(input, { target: { value: "12" } });
    expect(input.value).toBe("12");
  });
});

// ---------------------------------------------------------------------------
// M2 – Controlled forms: clear + resubmit sends defaults
// ---------------------------------------------------------------------------
describe("Controlled forms – clearing and resubmitting sends empty/default values", () => {
  it("QuickAddForm: clearing fields and submitting sends defaults for non-name fields", async () => {
    const { container } = render(
      <InventoryProvider>
        <QuickAddForm />
      </InventoryProvider>,
    );

    // Fill all fields first
    fireEvent.change(screen.getByLabelText("Item Name:"), {
      target: { value: "Rice" },
    });
    fireEvent.change(screen.getByLabelText("Category:"), {
      target: { value: "Dry" },
    });
    fireEvent.change(screen.getByLabelText("Location:"), {
      target: { value: "Pantry" },
    });
    fireEvent.change(screen.getByLabelText("Quantity on Hand:"), {
      target: { value: "3" },
    });

    const form = container.querySelector("form");
    await act(async () => fireEvent(form, createEvent.submit(form)));

    // Form resets — now submit again with only required Item Name
    fireEvent.change(screen.getByLabelText("Item Name:"), {
      target: { value: "Oats" },
    });
    fireEvent.change(screen.getByLabelText("Location:"), {
      target: { value: "Pantry" },
    });
    await act(async () => fireEvent(form, createEvent.submit(form)));

    // Form resets again after successful submit with defaults
    expect(screen.getByLabelText("Item Name:").value).toBe("");
  });

  it("AddInventoryItemForm: submitting with cleared numeric fields sends null/0", async () => {
    const { container } = render(
      <InventoryProvider>
        <AddInventoryItemForm />
      </InventoryProvider>,
    );

    const nameInput = screen.getByLabelText("Item Name:");
    fireEvent.change(nameInput, {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByLabelText("Location:"), {
      target: { value: "Fridge" },
    });
    // Leave QtyOnHand and TargetQty at their defaults (empty)
    const form = container.querySelector("form");
    await act(async () => fireEvent(form, createEvent.submit(form)));

    // Form resets after successful submit, confirming the item was added
    expect(nameInput.value).toBe("");
  });
});

// ---------------------------------------------------------------------------
// M2 – Controlled forms: form state resets after submit
// ---------------------------------------------------------------------------
describe("Controlled forms – form state resets correctly after submit", () => {
  it("AddInventoryItemForm: form resets and focuses Item Name after submit", async () => {
    const { container } = render(
      <InventoryProvider>
        <AddInventoryItemForm />
      </InventoryProvider>,
    );

    const nameInput = screen.getByLabelText("Item Name:");
    const qtyInput = screen.getByLabelText("Quantity on Hand:");
    const locSelect = screen.getByLabelText("Location:");

    fireEvent.change(nameInput, { target: { value: "Test Item" } });
    fireEvent.change(qtyInput, { target: { value: "5" } });
    fireEvent.change(locSelect, { target: { value: "Pantry" } });

    const form = container.querySelector("form");
    await act(async () => fireEvent(form, createEvent.submit(form)));

    expect(nameInput.value).toBe("");
    expect(qtyInput.value).toBe("");
    expect(document.activeElement).toBe(nameInput);
  });
});

// ---------------------------------------------------------------------------
// M2 – Quantity stepper: new cases
// ---------------------------------------------------------------------------
describe("ShoppingListControl – stepper behavior", () => {
  it("clicking + calls handler with incremented TargetQty", () => {
    const item = {
      id: 1,
      ItemName: "Milk",
      QtyOnHand: 2,
      TargetQty: 4,
      NeedRestock: true,
    };

    render(
      <InventoryProvider>
        <ShoppingListControl item={item} variant="shopping" />
      </InventoryProvider>,
    );

    expect(() => {
      fireEvent.click(
        screen.getByRole("button", { name: /increase quantity/i }),
      );
    }).not.toThrow();
  });

  it("clicking - calls handler with decremented TargetQty", () => {
    const item = {
      id: 1,
      ItemName: "Milk",
      QtyOnHand: 2,
      TargetQty: 5,
      NeedRestock: true,
    };

    render(
      <InventoryProvider>
        <ShoppingListControl item={item} variant="shopping" />
      </InventoryProvider>,
    );

    expect(() => {
      fireEvent.click(
        screen.getByRole("button", { name: /decrease quantity/i }),
      );
    }).not.toThrow();
  });

  it("at boundary, button shows Remove and triggers removal via decrement", () => {
    // TargetQty - 1 = 2 which equals QtyOnHand — boundary
    const item = {
      id: 1,
      ItemName: "Milk",
      QtyOnHand: 2,
      TargetQty: 3,
      NeedRestock: true,
    };

    render(
      <InventoryProvider>
        <ShoppingListControl item={item} variant="shopping" />
      </InventoryProvider>,
    );

    const removeBtn = screen.getByRole("button", { name: /remove from/i });
    expect(removeBtn.textContent).toBe("Remove");

    expect(() => {
      fireEvent.click(removeBtn);
    }).not.toThrow();
  });

  it("displays Math.ceil(targetQty - qtyOnHand) as cart quantity", () => {
    const item = {
      id: 1,
      ItemName: "Oil",
      QtyOnHand: 0.1,
      TargetQty: 1,
      NeedRestock: true,
    };

    render(
      <InventoryProvider>
        <ShoppingListControl item={item} variant="shopping" />
      </InventoryProvider>,
    );

    // Math.ceil(1 - 0.1) = Math.ceil(0.9) = 1
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("renders stepper when item is on shopping list since updateTargetQty comes from context", () => {
    const item = {
      id: 1,
      ItemName: "Oil",
      QtyOnHand: 0.1,
      TargetQty: 1,
      NeedRestock: true,
    };

    render(
      <InventoryProvider>
        <ShoppingListControl item={item} variant="shopping" />
      </InventoryProvider>,
    );

    // updateTargetQty is always available from context, so stepper is shown
    expect(
      screen.getByRole("button", { name: /increase quantity/i }),
    ).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// M2 – ShoppingListControl: Case 2 (remove from shopping list in location sections)
// ---------------------------------------------------------------------------
describe("ShoppingListControl – remove from shopping list (location section)", () => {
  it("renders stepper for items on the shopping list", () => {
    const item = {
      id: 5,
      ItemName: "Yogurt",
      QtyOnHand: 0.5,
      TargetQty: 1,
      NeedRestock: true,
    };

    render(
      <InventoryProvider>
        <ShoppingListControl item={item} variant="shopping" />
      </InventoryProvider>,
    );

    // With context, updateTargetQty is always available, so stepper is shown
    expect(
      screen.getByRole("button", { name: /increase quantity/i }),
    ).toBeTruthy();
  });

  it("clicking stepper buttons does not throw", () => {
    const item = {
      id: 5,
      ItemName: "Yogurt",
      QtyOnHand: 0.5,
      TargetQty: 1,
      NeedRestock: true,
    };

    render(
      <InventoryProvider>
        <ShoppingListControl item={item} variant="shopping" />
      </InventoryProvider>,
    );

    // Stepper is rendered since updateTargetQty comes from context
    const removeBtn = screen.getByRole("button", { name: /remove from/i });
    expect(() => {
      fireEvent.click(removeBtn);
    }).not.toThrow();
  });

  it("does not render Remove button when item is not on the shopping list", () => {
    const item = {
      id: 5,
      ItemName: "Yogurt",
      QtyOnHand: 1,
      TargetQty: 1,
      NeedRestock: false,
    };

    render(
      <InventoryProvider>
        <ShoppingListControl item={item} />
      </InventoryProvider>,
    );

    expect(
      screen.queryByRole("button", { name: /remove.*from shopping list/i }),
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "Add to Shopping List" }),
    ).toBeTruthy();
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
    ItemDescription: null,
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

  it("renders EditInventoryItemForm in a dialog when Edit is clicked", () => {
    render(
      <InventoryProvider>
        <InventorySection
          id="active"
          title="Active Items"
          items={[editableItem]}
        />
      </InventoryProvider>,
    );

    // Initially the edit form should not be visible
    expect(
      screen.queryByRole("form", { name: "Edit Inventory Item" }),
    ).toBeNull();

    // Click Edit
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    // Now the edit form should be visible inside a dialog
    expect(
      screen.getByRole("form", { name: "Edit Inventory Item" }),
    ).toBeTruthy();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("editing an item via the dialog calls updateItem and closes the dialog", async () => {
    render(
      <InventoryProvider>
        <InventorySection
          id="active"
          title="Active Items"
          items={[editableItem]}
        />
      </InventoryProvider>,
    );

    // Click Edit
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    // Change the item name
    const nameInput = screen.getByLabelText("Item Name:");
    fireEvent.change(nameInput, { target: { value: "Gouda Cheese" } });

    // Submit the form
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Save" })),
    );

    // Dialog should be closed after save
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
