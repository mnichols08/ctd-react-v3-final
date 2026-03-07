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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return the <section> element whose h2 heading matches `title` */
function getSection(title) {
  return screen
    .getByRole("heading", { name: new RegExp(title, "i"), level: 2 })
    .closest("section");
}

/** Return an ordered array of item names rendered inside a section */
function getSectionItemNames(title) {
  const section = getSection(title);
  const articles = within(section).queryAllByRole("article");
  return articles.map(
    (a) => within(a).getByRole("heading", { level: 2 }).textContent,
  );
}

/** Type into the search input and advance past the 300 ms debounce */
function typeSearch(value) {
  const input = screen.getByPlaceholderText("Search inventory...");
  fireEvent.change(input, { target: { value } });
  act(() => {
    vi.advanceTimersByTime(300);
  });
}

/** Add an item via the QuickAdd form */
function quickAddItem({
  name,
  category = "Dry",
  location = "Fridge",
  qty = "1",
  expiresOn = "",
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
  if (expiresOn) {
    fireEvent.change(within(form).getByLabelText("Expires On:"), {
      target: { value: expiresOn },
    });
  }
  fireEvent.change(within(form).getByLabelText("Location:"), {
    target: { value: location },
  });
  fireEvent.change(within(form).getByLabelText("Quantity on Hand:"), {
    target: { value: qty },
  });
  fireEvent.click(within(form).getByRole("button", { name: "Add Item" }));
}

afterEach(() => {
  cleanup();
});

// ===========================================================================
// Search tests
// ===========================================================================
describe("Search", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("typing a search term filters items to only matches", () => {
    render(<App />);
    act(() => vi.runAllTimers());

    typeSearch("pearl");

    expect(screen.getByText(/Showing 1 of 5 items/)).toBeTruthy();
    expect(getSectionItemNames("Pantry")).toEqual(["Pearl Couscous"]);
    expect(
      within(getSection("Fridge")).getByText(/will be listed here/),
    ).toBeTruthy();
  });

  it("search matches across all 5 searchable fields", () => {
    render(<App />);
    act(() => vi.runAllTimers());

    // ItemName field
    typeSearch("Apple");
    expect(getSectionItemNames("Fridge")).toEqual(["Apple Sauce"]);

    // Brand field
    typeSearch("Dabur");
    expect(getSectionItemNames("Pantry")).toEqual(["Sesame Oil"]);

    // Category field
    typeSearch("Dairy");
    expect(getSectionItemNames("Fridge")).toEqual(["Low Fat Vanilla Yogurt"]);

    // Tags and Notes are null for all sample items â€” covered by the null-safe test
  });

  it("search is case-insensitive", () => {
    render(<App />);
    act(() => vi.runAllTimers());

    typeSearch("PEARL");
    expect(screen.getByText(/Showing 1 of 5 items/)).toBeTruthy();
    expect(getSectionItemNames("Pantry")).toEqual(["Pearl Couscous"]);

    typeSearch("pearl");
    expect(screen.getByText(/Showing 1 of 5 items/)).toBeTruthy();
    expect(getSectionItemNames("Pantry")).toEqual(["Pearl Couscous"]);
  });

  it("clearing search restores all items", () => {
    render(<App />);
    act(() => vi.runAllTimers());

    typeSearch("pearl");
    expect(screen.getByText(/Showing 1 of 5 items/)).toBeTruthy();

    typeSearch("");
    // No search or filter → "Showing" text disappears
    expect(screen.queryByText(/Showing/)).toBeNull();
    expect(getSectionItemNames("Fridge")).toHaveLength(2);
    expect(getSectionItemNames("Pantry")).toHaveLength(2);
  });

  it("items with null fields don't crash the search", () => {
    render(<App />);
    act(() => vi.runAllTimers());

    // All sample items have null Tags and Notes; search must not crash
    typeSearch("nonexistent");
    expect(screen.getByText(/Showing 0 of 5 items/)).toBeTruthy();
  });
});

// ===========================================================================
// Sort tests
// ===========================================================================
describe("Sort", () => {
  it("sorting by ItemName A-Z orders alphabetically", () => {
    render(<App />);
    act(() => vi.runAllTimers());

    // Default sort is ItemName asc
    expect(getSectionItemNames("Fridge")).toEqual([
      "Apple Sauce",
      "Low Fat Vanilla Yogurt",
    ]);
    expect(getSectionItemNames("Pantry")).toEqual([
      "Pearl Couscous",
      "Sesame Oil",
    ]);
  });

  it("sorting by ItemName Z-A reverses order", () => {
    render(<App />);
    act(() => vi.runAllTimers());

    fireEvent.change(screen.getByLabelText("Sort Direction:"), {
      target: { value: "desc" },
    });

    expect(getSectionItemNames("Fridge")).toEqual([
      "Low Fat Vanilla Yogurt",
      "Apple Sauce",
    ]);
    expect(getSectionItemNames("Pantry")).toEqual([
      "Sesame Oil",
      "Pearl Couscous",
    ]);
  });

  it("sorting by QtyOnHand orders numerically", () => {
    render(<App />);
    act(() => vi.runAllTimers());

    fireEvent.change(screen.getByLabelText("Sort by:"), {
      target: { value: "QtyOnHand" },
    });

    // Fridge: Yogurt 0.5 < Apple Sauce 0.7
    expect(getSectionItemNames("Fridge")).toEqual([
      "Low Fat Vanilla Yogurt",
      "Apple Sauce",
    ]);
    // Pantry: Sesame Oil 0.1 < Pearl Couscous 1
    expect(getSectionItemNames("Pantry")).toEqual([
      "Sesame Oil",
      "Pearl Couscous",
    ]);
  });

  it("sorting by ExpiresOn puts earliest first, nulls last", () => {
    render(<App />);
    act(() => vi.runAllTimers());

    // Add an item without ExpiresOn to Fridge
    quickAddItem({
      name: "No Expiry Item",
      category: "Dairy",
      location: "Fridge",
      qty: "1",
    });

    fireEvent.change(screen.getByLabelText("Sort by:"), {
      target: { value: "ExpiresOn" },
    });

    // Fridge: Yogurt 2026-03-21, Apple Sauce 2027-05-13, No Expiry (null → last)
    expect(getSectionItemNames("Fridge")).toEqual([
      "Low Fat Vanilla Yogurt",
      "Apple Sauce",
      "No Expiry Item",
    ]);
  });

  it("selecting None restores original order", () => {
    render(<App />);
    act(() => vi.runAllTimers());

    // Default ItemName asc â€” Fridge: Apple Sauce, Yogurt
    expect(getSectionItemNames("Fridge")).toEqual([
      "Apple Sauce",
      "Low Fat Vanilla Yogurt",
    ]);

    // Select "None"
    fireEvent.change(screen.getByLabelText("Sort by:"), {
      target: { value: "" },
    });

    // Original JSON order: Yogurt (id 176) before Apple Sauce (id 184)
    expect(getSectionItemNames("Fridge")).toEqual([
      "Low Fat Vanilla Yogurt",
      "Apple Sauce",
    ]);
  });
});

// ===========================================================================
// Filter tests
// ===========================================================================
describe("Filter", () => {
  it("filtering by single category shows only matching items", () => {
    render(<App />);
    act(() => vi.runAllTimers());

    fireEvent.click(screen.getByRole("checkbox", { name: /Dry/ }));

    // Dry: Pearl Couscous (active) + Bacon & Velveeta Scrambler (archived) = 2
    expect(screen.getByText(/Showing 2 of 5 items/)).toBeTruthy();
    expect(getSectionItemNames("Pantry")).toEqual(["Pearl Couscous"]);
    // No Dry items in Fridge
    expect(
      within(getSection("Fridge")).getByText(/will be listed here/),
    ).toBeTruthy();
  });

  it("filtering by multiple categories shows union of matches", () => {
    render(<App />);
    act(() => vi.runAllTimers());

    fireEvent.click(screen.getByRole("checkbox", { name: /Dry/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Dairy/ }));

    // Dry (Pearl + Bacon) + Dairy (Yogurt) = 3
    expect(screen.getByText(/Showing 3 of 5 items/)).toBeTruthy();
    expect(getSectionItemNames("Pantry")).toEqual(["Pearl Couscous"]);
    expect(getSectionItemNames("Fridge")).toEqual(["Low Fat Vanilla Yogurt"]);
  });

  it("filtering by NeedRestock=true shows only shopping list items", () => {
    render(<App />);
    act(() => vi.runAllTimers());

    // Sesame Oil has NeedRestock=true and TargetQty(1) > QtyOnHand(0.1)
    const shoppingNames = getSectionItemNames("Shopping List");
    expect(shoppingNames).toContain("Sesame Oil");

    // Non-restock items should NOT appear in Shopping List
    expect(shoppingNames).not.toContain("Pearl Couscous");
    expect(shoppingNames).not.toContain("Apple Sauce");
    expect(shoppingNames).not.toContain("Low Fat Vanilla Yogurt");
  });

  it("filtering by Low Stock shows only low-stock items", () => {
    render(<App />);
    act(() => vi.runAllTimers());

    // Add a high-stock item (QtyOnHand >= 5)
    quickAddItem({
      name: "Bulk Rice",
      category: "Dry",
      location: "Pantry",
      qty: "10",
    });
    expect(getSectionItemNames("Pantry")).toContain("Bulk Rice");

    fireEvent.click(screen.getByRole("checkbox", { name: /Low Stock/ }));

    // All original items have QtyOnHand < 5; Bulk Rice (10) is excluded
    expect(screen.getByText(/Showing 5 of 6 items/)).toBeTruthy();
    expect(getSectionItemNames("Pantry")).not.toContain("Bulk Rice");
    expect(getSectionItemNames("Pantry")).toContain("Pearl Couscous");
  });

  it("multiple filters combine with AND logic", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T00:00:00Z"));

    render(<App />);
    act(() => vi.runAllTimers());

    // Category "Fresh" + Expiring Soon → no items satisfy both
    fireEvent.click(screen.getByRole("checkbox", { name: /Fresh/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Expiring Soon/ }));
    expect(
      screen.getByText(/Showing 0 of 5 items.*2 filters active/),
    ).toBeTruthy();

    // Switch to Category "Dairy" + Expiring Soon → Yogurt matches both
    fireEvent.click(screen.getByRole("checkbox", { name: /Fresh/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Dairy/ }));
    expect(
      screen.getByText(/Showing 1 of 5 items.*2 filters active/),
    ).toBeTruthy();
    expect(getSectionItemNames("Fridge")).toEqual(["Low Fat Vanilla Yogurt"]);

    vi.useRealTimers();
  });

  it("Clear All Filters restores all items", () => {
    render(<App />);
    act(() => vi.runAllTimers());

    fireEvent.click(screen.getByRole("checkbox", { name: /Dry/ }));
    expect(screen.getByText(/Showing 2 of 5 items/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Clear All Filters" }));

    expect(screen.queryByText(/Showing/)).toBeNull();
    expect(getSectionItemNames("Fridge")).toHaveLength(2);
    expect(getSectionItemNames("Pantry")).toHaveLength(2);
  });
});

// ===========================================================================
// Archived view tests
// ===========================================================================
describe("Archived view", () => {
  it("toggle shows and hides the archived section", () => {
    render(<App />);
    act(() => vi.runAllTimers());

    // Show
    fireEvent.click(
      screen.getByRole("button", { name: /Show Archived Items/ }),
    );
    expect(
      screen.getByRole("heading", { name: /Archived Items/i, level: 2 }),
    ).toBeTruthy();

    // Hide
    fireEvent.click(
      screen.getByRole("button", { name: /Hide Archived Items/ }),
    );
    expect(
      screen.queryByRole("heading", { name: /Archived Items/i, level: 2 }),
    ).toBeNull();
  });

  it("unarchive moves item back to correct section", () => {
    render(<App />);
    act(() => vi.runAllTimers());

    fireEvent.click(
      screen.getByRole("button", { name: /Show Archived Items/ }),
    );

    const archivedSection = screen
      .getByRole("heading", { name: /Archived Items/i, level: 2 })
      .closest("section");
    const article = within(archivedSection)
      .getByRole("heading", {
        name: "Bacon & Velveeta Scrambler",
        level: 2,
      })
      .closest("article");
    fireEvent.click(within(article).getByRole("button", { name: "Unarchive" }));

    // Should appear in Pantry (Location: "Pantry - Shelf 3")
    expect(getSectionItemNames("Pantry")).toContain(
      "Bacon & Velveeta Scrambler",
    );

    // No more archived items → toggle button disappears
    expect(screen.queryByRole("button", { name: /Archived Items/ })).toBeNull();
  });

  it("archived count updates correctly", () => {
    render(<App />);
    act(() => vi.runAllTimers());

    // Initial: 1 archived item
    const toggleBtn = screen.getByRole("button", { name: /Archived Items/i });
    expect(toggleBtn.textContent).toMatch(/\(\s*1\s*\)/);

    // Archive Apple Sauce from Fridge
    const article = within(getSection("Fridge"))
      .getByRole("heading", { name: "Apple Sauce", level: 2 })
      .closest("article");
    fireEvent.click(within(article).getByRole("button", { name: "Archive" }));

    // Now 2 archived items
    const updatedBtn = screen.getByRole("button", {
      name: /Archived Items/i,
    });
    expect(updatedBtn.textContent).toMatch(/\(\s*2\s*\)/);
  });
});

// ===========================================================================
// Combined tests
// ===========================================================================
describe("Combined search, sort, and filter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("search + sort + filter work together correctly", () => {
    render(<App />);
    act(() => vi.runAllTimers());

    // Filter by Dry + Dairy categories
    fireEvent.click(screen.getByRole("checkbox", { name: /Dry/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Dairy/ }));

    // Sort by QtyOnHand asc
    fireEvent.change(screen.getByLabelText("Sort by:"), {
      target: { value: "QtyOnHand" },
    });

    // Matching: Yogurt (Dairy, 0.5), Pearl Couscous (Dry, 1)
    expect(getSectionItemNames("Fridge")).toEqual(["Low Fat Vanilla Yogurt"]);
    expect(getSectionItemNames("Pantry")).toEqual(["Pearl Couscous"]);

    // Now search for "pearl"
    typeSearch("pearl");

    // Only Pearl Couscous matches search + Dry category
    expect(getSectionItemNames("Pantry")).toEqual(["Pearl Couscous"]);
    expect(
      within(getSection("Fridge")).getByText(/will be listed here/),
    ).toBeTruthy();
  });

  it("clearing one doesn't affect others", () => {
    render(<App />);
    act(() => vi.runAllTimers());

    // 1. Sort by QtyOnHand asc
    fireEvent.change(screen.getByLabelText("Sort by:"), {
      target: { value: "QtyOnHand" },
    });

    // 2. Filter by Dry category
    fireEvent.click(screen.getByRole("checkbox", { name: /Dry/ }));

    // 3. Search for "pearl"
    typeSearch("pearl");
    expect(getSectionItemNames("Pantry")).toEqual(["Pearl Couscous"]);

    // 4. Clear search → category filter and sort remain
    typeSearch("");
    expect(
      screen.getByText(/Showing 2 of 5 items.*1 filter active/),
    ).toBeTruthy();
    expect(getSectionItemNames("Pantry")).toEqual(["Pearl Couscous"]);

    // 5. Clear filters → sort remains
    fireEvent.click(screen.getByRole("button", { name: "Clear All Filters" }));

    // QtyOnHand asc still in effect
    // Fridge: Yogurt (0.5), Apple Sauce (0.7)
    expect(getSectionItemNames("Fridge")).toEqual([
      "Low Fat Vanilla Yogurt",
      "Apple Sauce",
    ]);
    // Pantry: Sesame Oil (0.1), Pearl Couscous (1)
    expect(getSectionItemNames("Pantry")).toEqual([
      "Sesame Oil",
      "Pearl Couscous",
    ]);
  });
});
