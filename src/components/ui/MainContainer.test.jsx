import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";

import MainContainer from "./MainContainer.component";
import inventorySampleData from "../../data/inventorySample.json";

vi.mock("../sections/ToolSection.component", () => ({
  default: ({ id, title, children }) => (
    <section id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

vi.mock("./QuickStatsBar.component", () => ({
  default: () => <div>QuickStatsBar</div>,
}));

vi.mock("../forms/FilterBarForm.component", () => ({
  default: () => <div>FilterBarForm</div>,
}));

vi.mock("../sections/InventorySection.component", () => ({
  default: ({ title, items, addToShoppingList, updateItemQuantity }) => (
    <section>
      <h2>{title}</h2>
      <p>{`count:${items.length}`}</p>
      <p>{items.map((item) => item.ItemName).join("|")}</p>
      <p>
        {items
          .map(
            (item) => `${item.ItemName}:${item.TargetQty}:${item.NeedRestock}`,
          )
          .join("|")}
      </p>
      {addToShoppingList && items[0] && (
        <form
          aria-label={`mock-form-${title}`}
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            addToShoppingList?.({
              itemId: items[0].id,
              quantity: formData.get("quantity"),
            });
          }}
        >
          <input
            aria-label={`mock-qty-${title}`}
            name="quantity"
            defaultValue="2"
          />
          <button type="submit">{`mock-add-${title}`}</button>
        </form>
      )}
      {updateItemQuantity && items[0] && (
        <button
          onClick={() => updateItemQuantity?.(items[0].id, items[0].QtyOnHand)}
        >
          {`mock-remove-${title}`}
        </button>
      )}
    </section>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("MainContainer", () => {
  it("initializes state from sample data and passes filtered section items", () => {
    const expectedFridgeCount = inventorySampleData.records.filter(
      (item) => item.Location.includes("Fridge") && item.Status !== "archived",
    ).length;
    const expectedFreezerCount = inventorySampleData.records.filter(
      (item) => item.Location.includes("Freezer") && item.Status !== "archived",
    ).length;
    const expectedPantryCount = inventorySampleData.records.filter(
      (item) => item.Location.includes("Pantry") && item.Status !== "archived",
    ).length;
    const expectedShoppingListCount = inventorySampleData.records.filter(
      (item) => item.NeedRestock && item.TargetQty > item.QtyOnHand,
    ).length;

    render(<MainContainer />);
    act(() => vi.runAllTimers());

    const fridgeSection = screen
      .getByRole("heading", { name: "Fridge" })
      .closest("section");
    const freezerSection = screen
      .getByRole("heading", { name: "Freezer" })
      .closest("section");
    const pantrySection = screen
      .getByRole("heading", { name: "Pantry" })
      .closest("section");
    const shoppingSection = screen
      .getByRole("heading", { name: "Shopping List" })
      .closest("section");

    expect(fridgeSection).toBeTruthy();
    expect(freezerSection).toBeTruthy();
    expect(pantrySection).toBeTruthy();
    expect(shoppingSection).toBeTruthy();

    expect(fridgeSection?.textContent).toContain(
      `count:${expectedFridgeCount}`,
    );
    expect(freezerSection?.textContent).toContain(
      `count:${expectedFreezerCount}`,
    );
    expect(pantrySection?.textContent).toContain(
      `count:${expectedPantryCount}`,
    );
    expect(shoppingSection?.textContent).toContain(
      `count:${expectedShoppingListCount}`,
    );
  });

  it("submits an add-item form and updates state-backed section data", () => {
    const initialPantryCount = inventorySampleData.records.filter(
      (item) => item.Location.includes("Pantry") && item.Status !== "archived",
    ).length;

    render(<MainContainer />);
    act(() => vi.runAllTimers());

    // Locate the "Add Item" ToolSection and the default QuickAddForm by its accessible name
    const addItemSection = screen
      .getByRole("heading", { name: "Add Item" })
      .closest("section");
    const addForm = within(addItemSection).getByRole("form", {
      name: "Quick add inventory item",
    });

    fireEvent.change(within(addForm).getByLabelText("Item Name:"), {
      target: { value: "Test Granola Bars" },
    });
    fireEvent.change(within(addForm).getByLabelText("Category:"), {
      target: { value: "Snacks" },
    });
    fireEvent.change(within(addForm).getByLabelText("Location:"), {
      target: { value: "Pantry" },
    });
    fireEvent.change(within(addForm).getByLabelText("Quantity on Hand:"), {
      target: { value: "3" },
    });

    fireEvent.click(within(addForm).getByRole("button", { name: "Add Item" }));

    const pantrySection = screen
      .getByRole("heading", { name: "Pantry" })
      .closest("section");

    expect(pantrySection).toBeTruthy();
    expect(pantrySection?.textContent).toContain(
      `count:${initialPantryCount + 1}`,
    );
    expect(pantrySection?.textContent).toContain("Test Granola Bars");
  });

  it("submits add-to-shopping-list form and updates shopping-list state/render", () => {
    const initialShoppingListCount = inventorySampleData.records.filter(
      (item) => item.NeedRestock && item.TargetQty > item.QtyOnHand,
    ).length;

    const pantryCandidate = inventorySampleData.records.find(
      (item) => item.Location.includes("Pantry") && !item.NeedRestock,
    );

    expect(pantryCandidate).toBeTruthy();

    render(<MainContainer />);
    act(() => vi.runAllTimers());

    fireEvent.change(screen.getByLabelText("mock-qty-Pantry"), {
      target: { value: "2" },
    });

    fireEvent.submit(screen.getByRole("form", { name: "mock-form-Pantry" }));

    const shoppingSection = screen
      .getByRole("heading", { name: "Shopping List" })
      .closest("section");

    expect(shoppingSection).toBeTruthy();
    expect(shoppingSection?.textContent).toContain(
      `count:${initialShoppingListCount + 1}`,
    );
    expect(shoppingSection?.textContent).toContain(pantryCandidate?.ItemName);
  });

  it("removes an item from shopping-list state/render path", () => {
    const initialShoppingListItems = inventorySampleData.records.filter(
      (item) => item.NeedRestock && item.TargetQty > item.QtyOnHand,
    );
    const initialShoppingListCount = initialShoppingListItems.length;
    const shoppingItemToRemove = initialShoppingListItems[0];

    expect(shoppingItemToRemove).toBeTruthy();

    render(<MainContainer />);
    act(() => vi.runAllTimers());

    fireEvent.click(
      screen.getByRole("button", { name: "mock-remove-Shopping List" }),
    );

    const shoppingSection = screen
      .getByRole("heading", { name: "Shopping List" })
      .closest("section");

    expect(shoppingSection).toBeTruthy();
    expect(shoppingSection?.textContent).toContain(
      `count:${initialShoppingListCount - 1}`,
    );
    expect(shoppingSection?.textContent).not.toContain(
      shoppingItemToRemove?.ItemName,
    );
  });

  it("resets TargetQty to QtyOnHand when removing from shopping list via stepper", () => {
    const initialShoppingListItems = inventorySampleData.records.filter(
      (item) => item.NeedRestock && item.TargetQty > item.QtyOnHand,
    );
    const shoppingItemToRemove = initialShoppingListItems[0];

    expect(shoppingItemToRemove).toBeTruthy();

    const sectionTitle = shoppingItemToRemove.Location.includes("Fridge")
      ? "Fridge"
      : shoppingItemToRemove.Location.includes("Freezer")
        ? "Freezer"
        : "Pantry";

    render(<MainContainer />);
    act(() => vi.runAllTimers());

    fireEvent.click(
      screen.getByRole("button", { name: "mock-remove-Shopping List" }),
    );

    const locationSection = screen
      .getByRole("heading", { name: sectionTitle })
      .closest("section");

    expect(locationSection).toBeTruthy();
    expect(locationSection?.textContent).toContain(
      `${shoppingItemToRemove.ItemName}:${shoppingItemToRemove.QtyOnHand}:false`,
    );
  });
  it("toggles between QuickAddForm and AddInventoryItemForm", () => {
    render(<MainContainer />);
    act(() => vi.runAllTimers());

    // QuickAddForm should be visible by default
    expect(
      screen.getByRole("form", { name: "Quick add inventory item" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("form", { name: "Add Inventory Item" }),
    ).toBeNull();

    // Toggle button should offer to switch to Full Form
    const toggleBtn = screen.getByRole("button", {
      name: "Switch to Full Form",
    });
    expect(toggleBtn).toBeTruthy();

    // Click toggle to switch to Full Form
    fireEvent.click(toggleBtn);

    // AddInventoryItemForm should now be visible, QuickAddForm hidden
    expect(
      screen.getByRole("form", { name: "Add Inventory Item" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("form", { name: "Quick add inventory item" }),
    ).toBeNull();

    // Button text should update
    expect(
      screen.getByRole("button", { name: "Switch to Quick Add" }),
    ).toBeTruthy();

    // Click toggle to switch back
    fireEvent.click(
      screen.getByRole("button", { name: "Switch to Quick Add" }),
    );

    // QuickAddForm should be back
    expect(
      screen.getByRole("form", { name: "Quick add inventory item" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("form", { name: "Add Inventory Item" }),
    ).toBeNull();
  });

  // -- Loading / Error UI --------------------------------------------------

  it("loading spinner renders while isLoading is true", () => {
    render(<MainContainer />);

    // Before timers resolve, the loading indicator should be visible
    const loadingStatus = screen.getByRole("status");
    expect(loadingStatus).toBeTruthy();
    expect(loadingStatus.textContent).toContain("Loading...");

    // Inventory sections should NOT be rendered yet
    expect(screen.queryByRole("heading", { name: "Fridge" })).toBeNull();

    // After loading completes, the spinner disappears
    act(() => vi.runAllTimers());
    expect(screen.queryByText("Loading...")).toBeNull();
    expect(screen.getByRole("heading", { name: "Fridge" })).toBeTruthy();
  });

  it("error message and Retry button render when error is set", () => {
    // Make Math.random return 0 so loadSampleData triggers its failure branch
    vi.spyOn(Math, "random").mockReturnValue(0);

    render(<MainContainer />);
    act(() => vi.runAllTimers());

    // Error alert should be visible with the failure message
    const alertEl = screen.getByRole("alert");
    expect(alertEl).toBeTruthy();
    expect(alertEl.textContent).toContain(
      "Failed to load sample data. Please try again.",
    );

    // Retry button should be present
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();

    // Inventory sections should NOT be rendered
    expect(screen.queryByRole("heading", { name: "Fridge" })).toBeNull();
  });

  it("Retry clears error and re-fetches", () => {
    // First render triggers a failure
    vi.spyOn(Math, "random").mockReturnValue(0);

    render(<MainContainer />);
    act(() => vi.runAllTimers());

    // Error is shown
    expect(screen.getByRole("alert")).toBeTruthy();

    // Now make the next load succeed
    vi.mocked(Math.random).mockReturnValue(1);

    // Click Retry
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    // After retry triggers loadSampleData again, advance timers to resolve loading
    act(() => vi.runAllTimers());

    // Error should be cleared
    expect(screen.queryByRole("alert")).toBeNull();

    // Inventory sections should now render
    expect(screen.getByRole("heading", { name: "Fridge" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Pantry" })).toBeTruthy();
  });
});
