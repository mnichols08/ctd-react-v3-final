import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import MainContainer from "./MainContainer.component";
import inventorySampleData from "../../data/inventoryData.json";

vi.mock("../sections/ToolSection.component", () => ({
  default: ({ children }) => <section>{children}</section>,
}));

vi.mock("./QuickStatsBar.component", () => ({
  default: () => <div>QuickStatsBar</div>,
}));

vi.mock("../forms/FilterBarForm.component", () => ({
  default: () => <div>FilterBarForm</div>,
}));

vi.mock("../sections/InventorySection.component", () => ({
  default: ({
    title,
    items,
    shoppingCart = false,
    addToShoppingList,
    removeFromShoppingList,
  }) => (
    <section>
      <h2>{title}</h2>
      <p>{`count:${items.length}`}</p>
      <p>{shoppingCart ? "shopping:true" : "shopping:false"}</p>
      <p>{items.map((item) => item.ItemName).join("|")}</p>
      <p>
        {items
          .map(
            (item) => `${item.ItemName}:${item.TargetQty}:${item.NeedRestock}`,
          )
          .join("|")}
      </p>
      {!shoppingCart && items[0] && (
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
      {shoppingCart && items[0] && (
        <button onClick={() => removeFromShoppingList?.(items[0].id)}>
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
    const expectedFridgeCount = inventorySampleData.records.filter((item) =>
      item.Location.includes("Fridge"),
    ).length;
    const expectedFreezerCount = inventorySampleData.records.filter((item) =>
      item.Location.includes("Freezer"),
    ).length;
    const expectedPantryCount = inventorySampleData.records.filter((item) =>
      item.Location.includes("Pantry"),
    ).length;
    const expectedShoppingListCount = inventorySampleData.records.filter(
      (item) => item.NeedRestock && item.TargetQty > item.QtyOnHand,
    ).length;

    render(<MainContainer />);

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
    expect(shoppingSection?.textContent).toContain("shopping:true");
  });

  it("submits AddInventoryItemForm and updates state-backed section data", () => {
    const initialPantryCount = inventorySampleData.records.filter((item) =>
      item.Location.includes("Pantry"),
    ).length;

    render(<MainContainer />);

    fireEvent.change(screen.getByLabelText("Item Name:"), {
      target: { value: "Test Granola Bars" },
    });
    fireEvent.change(screen.getByLabelText("Location:"), {
      target: { value: "Pantry" },
    });
    fireEvent.change(screen.getByLabelText("Qty On Hand:"), {
      target: { value: "3" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Add Item" }));

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

  it("preserves TargetQty when removing from shopping list", () => {
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

    fireEvent.click(
      screen.getByRole("button", { name: "mock-remove-Shopping List" }),
    );

    const locationSection = screen
      .getByRole("heading", { name: sectionTitle })
      .closest("section");

    expect(locationSection).toBeTruthy();
    expect(locationSection?.textContent).toContain(
      `${shoppingItemToRemove.ItemName}:${shoppingItemToRemove.TargetQty}:false`,
    );
  });
});
