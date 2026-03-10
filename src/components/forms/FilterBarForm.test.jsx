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

/** Return an ordered array of item names rendered inside a section */
function getSectionItemNames(title) {
  const section = getSection(title);
  const listItems = within(section).queryAllByRole("listitem");
  return listItems
    .map((item) =>
      within(item).queryByRole("heading", {
        level: 2,
      }),
    )
    .filter(Boolean)
    .map((heading) => heading.textContent);
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
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    typeSearch("pearl couscous");

    expect(screen.getByText(/Showing 1 of \d+ items/)).toBeTruthy();
    expect(getSectionItemNames("Pantry")).toEqual(["Pearl Couscous"]);
    expect(
      within(getSection("Fridge")).getByText(/will be listed here/),
    ).toBeTruthy();
  });

  it("search matches across all 5 searchable fields", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    // ItemName field
    typeSearch("Apple");
    expect(getSectionItemNames("Fridge")).toEqual(["Apple Sauce"]);

    // Brand field
    typeSearch("Dabur");
    expect(getSectionItemNames("Pantry")).toEqual(["Sesame Oil"]);

    // Category field
    typeSearch("Dairy");
    expect(getSectionItemNames("Fridge")).toContain("Low Fat Vanilla Yogurt");

    // Tags and Notes are null for all sample items - covered by the null-safe test
  });

  it("search is case-insensitive", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    typeSearch("PEARL COUSCOUS");
    expect(screen.getByText(/Showing 1 of \d+ items/)).toBeTruthy();
    expect(getSectionItemNames("Pantry")).toEqual(["Pearl Couscous"]);

    typeSearch("pearl couscous");
    expect(screen.getByText(/Showing 1 of \d+ items/)).toBeTruthy();
    expect(getSectionItemNames("Pantry")).toEqual(["Pearl Couscous"]);
  });

  it("clearing search restores all items", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    typeSearch("pearl couscous");
    expect(screen.getByText(/Showing 1 of \d+ items/)).toBeTruthy();

    typeSearch("");
    expect(screen.queryByText(/Showing \d+ of \d+ items/)).toBeNull();
    expect(getSectionItemNames("Fridge").length).toBeGreaterThan(0);
    expect(getSectionItemNames("Pantry").length).toBeGreaterThan(0);
  });

  it("items with null fields don't crash the search", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    // All sample items have null Tags and Notes; search must not crash
    typeSearch("nonexistent");
    expect(screen.getByText(/Showing 0 of \d+ items/)).toBeTruthy();
  });
});

// ===========================================================================
// Sort tests
// ===========================================================================
describe("Sort", () => {
  it("sorting by ItemName A-Z orders alphabetically", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    quickAddItem({ name: "Bravo Item", location: "Freezer" });
    quickAddItem({ name: "Alpha Item", location: "Freezer" });

    expect(getSectionItemNames("Freezer")).toEqual([
      "Alpha Item",
      "Bravo Item",
    ]);
  });

  it("sorting by ItemName Z-A reverses order", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    quickAddItem({ name: "Bravo Item", location: "Freezer" });
    quickAddItem({ name: "Alpha Item", location: "Freezer" });

    fireEvent.change(screen.getByLabelText("Sort Direction:"), {
      target: { value: "desc" },
    });

    expect(getSectionItemNames("Freezer")).toEqual([
      "Bravo Item",
      "Alpha Item",
    ]);
  });

  it("sorting by QtyOnHand orders numerically", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    quickAddItem({ name: "Three Count", location: "Freezer", qty: "3" });
    quickAddItem({ name: "One Count", location: "Freezer", qty: "1" });

    fireEvent.change(screen.getByLabelText("Sort by:"), {
      target: { value: "QtyOnHand" },
    });

    expect(getSectionItemNames("Freezer")).toEqual([
      "One Count",
      "Three Count",
    ]);
  });

  it("sorting by ExpiresOn puts earliest first, nulls last", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    quickAddItem({
      name: "Later Expiry",
      category: "Dairy",
      location: "Freezer",
      qty: "1",
      expiresOn: "2026-04-01",
    });
    quickAddItem({
      name: "No Expiry Item",
      category: "Dairy",
      location: "Freezer",
      qty: "1",
    });
    quickAddItem({
      name: "Soon Expiry",
      category: "Dairy",
      location: "Freezer",
      qty: "1",
      expiresOn: "2026-03-21",
    });

    fireEvent.change(screen.getByLabelText("Sort by:"), {
      target: { value: "ExpiresOn" },
    });

    expect(getSectionItemNames("Freezer")).toEqual([
      "Soon Expiry",
      "Later Expiry",
      "No Expiry Item",
    ]);
  });

  it("selecting None restores original order", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    quickAddItem({ name: "Zulu Item", location: "Freezer" });
    quickAddItem({ name: "Alpha Item", location: "Freezer" });

    expect(getSectionItemNames("Freezer")).toEqual(["Alpha Item", "Zulu Item"]);

    // Select "None"
    fireEvent.change(screen.getByLabelText("Sort by:"), {
      target: { value: "" },
    });

    expect(getSectionItemNames("Freezer")).toEqual(["Zulu Item", "Alpha Item"]);
  });
});

// ===========================================================================
// Filter tests
// ===========================================================================
describe("Filter", () => {
  it("filtering by single category shows only matching items", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    fireEvent.click(screen.getByRole("checkbox", { name: /Dry/ }));

    expect(screen.getByText(/1 filter active/)).toBeTruthy();
    expect(getSectionItemNames("Pantry").length).toBeGreaterThan(0);
    // No Dry items in Fridge
    expect(
      within(getSection("Fridge")).getByText(/will be listed here/),
    ).toBeTruthy();
  });

  it("filtering by multiple categories shows union of matches", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    fireEvent.click(screen.getByRole("checkbox", { name: /Dry/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Dairy/ }));

    expect(screen.getByText(/Showing \d+ of \d+ items/)).toBeTruthy();
    expect(getSectionItemNames("Fridge")).toContain("Low Fat Vanilla Yogurt");
    expect(getSectionItemNames("Pantry").length).toBeGreaterThan(0);
  });

  it("filtering by NeedRestock=true shows only shopping list items", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
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
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    // Add a high-stock item (QtyOnHand >= 5)
    quickAddItem({
      name: "Bulk Rice",
      category: "Dry",
      location: "Pantry",
      qty: "10",
    });
    typeSearch("Bulk Rice");
    expect(getSectionItemNames("Pantry")).toContain("Bulk Rice");
    typeSearch("");

    fireEvent.click(screen.getByRole("checkbox", { name: /Low Stock/ }));

    expect(screen.getByText(/Showing \d+ of \d+ items/)).toBeTruthy();
    expect(getSectionItemNames("Pantry")).not.toContain("Bulk Rice");
    expect(getSectionItemNames("Pantry").length).toBeGreaterThan(0);
  });

  it("multiple filters combine with AND logic", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T00:00:00Z"));

    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    // Category "Fresh" + Expiring Soon ? no items satisfy both
    fireEvent.click(screen.getByRole("checkbox", { name: /Fresh/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Expiring Soon/ }));
    expect(
      screen.getByText(/Showing 0 of \d+ items.*2 filters active/),
    ).toBeTruthy();

    // Switch to Category "Dairy" + Expiring Soon ? Yogurt matches both
    fireEvent.click(screen.getByRole("checkbox", { name: /Fresh/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Dairy/ }));
    expect(
      screen.getByText(/Showing \d+ of \d+ items.*2 filters active/),
    ).toBeTruthy();
    expect(getSectionItemNames("Fridge")).toContain("Low Fat Vanilla Yogurt");

    vi.useRealTimers();
  });

  it("Clear All Filters restores all items", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    fireEvent.click(screen.getByRole("checkbox", { name: /Dry/ }));
    expect(screen.getByText(/1 filter active/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Clear All Filters" }));

    expect(screen.queryByText(/filter active/)).toBeNull();
    expect(getSectionItemNames("Fridge").length).toBeGreaterThan(0);
    expect(getSectionItemNames("Pantry").length).toBeGreaterThan(0);
  });

  it("Clear All Filters preserves the search term", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    // Search + filter
    typeSearch("couscous");
    fireEvent.click(screen.getByRole("checkbox", { name: /Dry/ }));
    expect(getSectionItemNames("Pantry")).toEqual(["Pearl Couscous"]);

    // Clear only filters — search should remain active
    fireEvent.click(screen.getByRole("button", { name: "Clear All Filters" }));

    // Search "couscous" is still in effect
    expect(screen.getByDisplayValue("couscous")).toBeTruthy();
    expect(getSectionItemNames("Pantry")).toEqual(["Pearl Couscous"]);
    // Other items still filtered out by search
    expect(
      within(getSection("Fridge")).getByText(/will be listed here/),
    ).toBeTruthy();
  });

  it("Reset clears search, sort, and structured filters", () => {
    vi.useFakeTimers();

    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    typeSearch("couscous");
    fireEvent.click(screen.getByRole("checkbox", { name: /Dry/ }));
    fireEvent.change(screen.getByLabelText("Sort by:"), {
      target: { value: "QtyOnHand" },
    });
    fireEvent.change(screen.getByLabelText("Sort Direction:"), {
      target: { value: "desc" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByLabelText("Search:").value).toBe("");
    expect(screen.getByLabelText("Sort by:").value).toBe("");
    expect(screen.getByLabelText("Sort Direction:").value).toBe("asc");
    expect(screen.getByRole("checkbox", { name: /Dry/ }).checked).toBe(false);
    expect(screen.queryByText(/Showing \d+ of \d+ items/)).toBeNull();

    vi.useRealTimers();
  });
});

// ===========================================================================
// Archived view tests
// ===========================================================================
describe("Archived view", () => {
  it("toggle shows and hides the archived section", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    const article = within(getSection("Fridge"))
      .getByRole("heading", { name: "Apple Sauce", level: 2 })
      .closest("article");
    fireEvent.click(within(article).getByRole("button", { name: "Archive" }));

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
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    typeSearch("Pearl Couscous");
    const pantryArticle = within(getSection("Pantry"))
      .getByRole("heading", { name: "Pearl Couscous", level: 2 })
      .closest("article");
    fireEvent.click(
      within(pantryArticle).getByRole("button", { name: "Archive" }),
    );
    typeSearch("");

    fireEvent.click(
      screen.getByRole("button", { name: /Show Archived Items/ }),
    );

    const archivedSection = screen
      .getByRole("heading", { name: /Archived Items/i, level: 2 })
      .closest("section");
    fireEvent.click(
      within(archivedSection).getByRole("button", { name: /Show Collapsed/i }),
    );
    const article = within(archivedSection)
      .getByRole("heading", {
        name: "Pearl Couscous",
        level: 2,
      })
      .closest("article");
    fireEvent.click(within(article).getByRole("button", { name: "Unarchive" }));
    typeSearch("Pearl Couscous");

    // Should appear in Pantry (Location: "Pantry - Shelf 3")
    expect(getSectionItemNames("Pantry")).toContain("Pearl Couscous");
  });

  it("archived count updates correctly", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    // Archive Apple Sauce from Fridge
    const firstArticle = within(getSection("Fridge"))
      .getByRole("heading", { name: "Apple Sauce", level: 2 })
      .closest("article");
    fireEvent.click(
      within(firstArticle).getByRole("button", { name: "Archive" }),
    );

    const toggleBtn = screen.getByRole("button", { name: /Archived Items/i });
    expect(toggleBtn.textContent).toMatch(/\(\s*1\s*\)/);

    const secondArticle = within(getSection("Fridge"))
      .getByRole("heading", { name: "Low Fat Vanilla Yogurt", level: 2 })
      .closest("article");
    fireEvent.click(
      within(secondArticle).getByRole("button", { name: "Archive" }),
    );

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
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    // Filter by Dry + Dairy categories
    fireEvent.click(screen.getByRole("checkbox", { name: /Dry/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Dairy/ }));

    // Sort by QtyOnHand asc
    fireEvent.change(screen.getByLabelText("Sort by:"), {
      target: { value: "QtyOnHand" },
    });

    expect(getSectionItemNames("Fridge")).toContain("Low Fat Vanilla Yogurt");

    // Now search for a specific dry match
    typeSearch("pearl couscous");

    // Only Pearl Couscous matches search + Dry category
    expect(getSectionItemNames("Pantry")).toEqual(["Pearl Couscous"]);
    expect(
      within(getSection("Fridge")).getByText(/will be listed here/),
    ).toBeTruthy();
  });

  it("clearing one doesn't affect others", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    // 1. Sort by QtyOnHand asc
    fireEvent.change(screen.getByLabelText("Sort by:"), {
      target: { value: "QtyOnHand" },
    });

    // 2. Filter by Dry category
    fireEvent.click(screen.getByRole("checkbox", { name: /Dry/ }));

    // 3. Search for a specific dry match
    typeSearch("pearl couscous");
    expect(getSectionItemNames("Pantry")).toEqual(["Pearl Couscous"]);

    // 4. Clear search ? category filter and sort remain
    typeSearch("");
    expect(screen.getByText(/1 filter active/)).toBeTruthy();
    expect(
      within(getSection("Fridge")).getByText(/will be listed here/),
    ).toBeTruthy();

    // 5. Clear filters ? sort remains
    fireEvent.click(screen.getByRole("button", { name: "Clear All Filters" }));

    const fridgeNames = getSectionItemNames("Fridge");
    expect(fridgeNames).toContain("Low Fat Vanilla Yogurt");
    expect(fridgeNames).toContain("Apple Sauce");

    expect(getSectionItemNames("Pantry")).toContain("Sesame Oil");
  });
});

// ===========================================================================
// Refresh tests
// ===========================================================================
describe("Refresh", () => {
  it("clicking Refresh reloads inventory data", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    // Inventory sections should be visible
    expect(getSection("Fridge")).toBeTruthy();
    expect(getSection("Pantry")).toBeTruthy();

    // Click Refresh
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    act(() => vi.runAllTimers());

    // Data should still be present after reload
    expect(getSection("Fridge")).toBeTruthy();
    expect(getSection("Pantry")).toBeTruthy();
  });

  it("Refresh restores data after user modifies inventory state", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    const initialFreezerNames = getSectionItemNames("Freezer");

    // Add an item to Freezer so the result is not hidden behind pagination
    quickAddItem({ name: "Test Item", location: "Freezer" });
    expect(getSectionItemNames("Freezer")).toContain("Test Item");

    // Click Refresh � sample data is reloaded, clearing the local addition
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    act(() => vi.runAllTimers());

    expect(getSectionItemNames("Freezer")).toEqual(initialFreezerNames);
    expect(getSectionItemNames("Freezer")).not.toContain("Test Item");
  });
});
