import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";

import AddInventoryItemForm from "./AddInventoryItemForm.component";
import AddShoppingListItemForm from "./AddShoppingListItemForm.component";
import ItemCard from "../cards/ItemCard.component";

afterEach(() => {
  cleanup();
});

describe("AddInventoryItemForm", () => {
  it("renders all form sections and submit action", () => {
    render(<AddInventoryItemForm />);

    expect(
      screen.getByRole("heading", { name: "Add Inventory Item" }),
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
    render(<AddInventoryItemForm />);

    expect(screen.getByLabelText("Item Name:").required).toBe(true);
    expect(screen.getByLabelText("Qty On Hand:").required).toBe(true);
  });
});

describe("AddShoppingListItemForm", () => {
  it("renders quantity input and submit button", () => {
    render(<AddShoppingListItemForm itemId={25} />);

    expect(
      screen.getByRole("heading", { name: "Add Item to Shopping List" }),
    ).toBeTruthy();
    expect(screen.getByLabelText("Quantity:")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Add to Shopping List" }),
    ).toBeTruthy();
  });

  it("includes hidden item id and enforces minimum quantity", () => {
    const { container } = render(<AddShoppingListItemForm itemId={25} />);

    const hiddenItemId = container.querySelector(
      "input[type='hidden'][name='itemId']",
    );
    const quantityInput = screen.getByLabelText("Quantity:");

    expect(hiddenItemId).toBeTruthy();
    expect(hiddenItemId?.getAttribute("value")).toBe("25");
    expect(quantityInput.getAttribute("min")).toBe("1");
    expect(quantityInput.required).toBe(true);
  });
});

describe("ItemCard", () => {
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

    render(<ItemCard item={item} />);

    expect(
      screen.getByRole("heading", { name: "Blueberries", level: 2 }),
    ).toBeTruthy();
    expect(screen.getByText("Quantity: 2 bags")).toBeTruthy();
    expect(screen.getByText("Expiration Date: 2026-04-10")).toBeTruthy();
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

    render(<ItemCard item={item} />);

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
});
