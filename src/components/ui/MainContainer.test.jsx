import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import MainContainer from "./MainContainer.component";
import inventorySampleData from "../../data/inventoryData.json";

vi.mock("../sections/ToolSection.component", () => ({
  default: ({ children }) => <section>{children}</section>,
}));

vi.mock("./QuickStatsBar.component", () => ({
  default: () => <div>QuickStatsBar</div>,
}));

vi.mock("../forms/AddInventoryItemForm.component", () => ({
  default: ({ addInventoryItem }) => (
    <div>
      {typeof addInventoryItem === "function"
        ? "has-add-handler"
        : "no-add-handler"}
    </div>
  ),
}));

vi.mock("../forms/FilterBarForm.component", () => ({
  default: () => <div>FilterBarForm</div>,
}));

vi.mock("../sections/InventorySection.component", () => ({
  default: ({ title, items, shoppingCart = false }) => (
    <section>
      <h2>{title}</h2>
      <p>{`count:${items.length}`}</p>
      <p>{shoppingCart ? "shopping:true" : "shopping:false"}</p>
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
      (item) =>
        item.NeedRestock === "checked" && item.TargetQty > item.QtyOnHand,
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

  it("passes addInventoryItem callback into AddInventoryItemForm", () => {
    render(<MainContainer />);
    expect(screen.getByText("has-add-handler")).toBeTruthy();
  });
});
