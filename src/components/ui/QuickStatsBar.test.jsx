import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import App from "../../App";
import { InventoryProvider } from "../../context/InventoryProvider";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return the <section> element whose h2 heading matches `title` */
function getSection(title) {
  return screen
    .getByRole("heading", { name: new RegExp(title, "i"), level: 2 })
    .closest("section");
}

/** Add an item via the QuickAdd form */
function quickAddItem({
  name,
  category = "Dry",
  location = "Fridge",
  qty = "1",
}) {
  const addSection = getSection("Add Item");
  const form = within(addSection).getByRole("form", {
    name: "Quick add inventory item",
  });
  fireEvent.change(within(form).getByLabelText("Item Name:"), {
    target: { value: name },
  });
  fireEvent.change(within(form).getByLabelText("Category:"), {
    target: { value: category },
  });
  fireEvent.change(within(form).getByLabelText("Location:"), {
    target: { value: location },
  });
  fireEvent.change(within(form).getByLabelText("Quantity on Hand:"), {
    target: { value: qty },
  });
  fireEvent.click(within(form).getByRole("button", { name: "Add Item" }));
}

/** Read the numeric text next to a QuickStatsBar heading */
function getStatValue(label) {
  const h = screen.getByRole("heading", { name: label, level: 3 });
  return h.nextElementSibling?.textContent;
}

afterEach(() => {
  cleanup();
});

// ===========================================================================
// QuickStatsBar integration tests
// ===========================================================================
describe("QuickStatsBar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-05T00:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("stats reflect current inventory state", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    expect(getStatValue("Total Items")).toBe("4");
    expect(getStatValue("Need Restock")).toBe("1");
    expect(getStatValue("Expiring Soon")).toBe("0");
    expect(getStatValue("Shopping List")).toBe("1");
  });

  it("stats update after adding/removing/archiving items", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    expect(getStatValue("Total Items")).toBe("4");

    // Add an item → total increases
    quickAddItem({
      name: "Test Milk",
      category: "Dairy",
      location: "Fridge",
      qty: "3",
    });
    expect(getStatValue("Total Items")).toBe("5");

    // Delete (remove) an item → total decreases
    const milkArticle = within(getSection("Fridge"))
      .getByRole("heading", { name: "Test Milk", level: 2 })
      .closest("article");
    fireEvent.click(
      within(milkArticle).getByRole("button", { name: "Delete" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(getStatValue("Total Items")).toBe("4");

    // Archive an item → total decreases further
    const article = within(getSection("Fridge"))
      .getByRole("heading", { name: "Apple Sauce", level: 2 })
      .closest("article");
    fireEvent.click(within(article).getByRole("button", { name: "Archive" }));

    expect(getStatValue("Total Items")).toBe("3");
  });

  it("expiring soon calculation is accurate", () => {
    // Yogurt expires 2026-03-21 → 11 days from Mar 10 → within 14-day threshold
    vi.setSystemTime(new Date("2026-03-10T00:00:00Z"));

    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    expect(getStatValue("Expiring Soon")).toBe("1");
  });
});
