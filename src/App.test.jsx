import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";

import App from "./App";
import { InventoryProvider } from "./context/InventoryProvider";

afterEach(() => {
  cleanup();
});

function addQuickItem(addForm, itemName, location = "Pantry") {
  fireEvent.change(within(addForm).getByLabelText("Item Name:"), {
    target: { value: itemName },
  });
  fireEvent.change(within(addForm).getByLabelText("Category:"), {
    target: { value: "Dry" },
  });
  fireEvent.change(within(addForm).getByLabelText("Location:"), {
    target: { value: location },
  });
  fireEvent.change(within(addForm).getByLabelText("Quantity on Hand:"), {
    target: { value: "1" },
  });
  fireEvent.change(within(addForm).getByLabelText("Unit:"), {
    target: { value: "box" },
  });
  fireEvent.click(within(addForm).getByRole("button", { name: "Add Item" }));
}

describe("App", () => {
  it("renders header, inventory, and footer sections", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    expect(
      screen.getByRole("heading", { name: "Kitchen Inventory", level: 1 }),
    ).toBeTruthy();
    expect(screen.getByRole("main")).toBeTruthy();
    expect(screen.getByRole("contentinfo")).toBeTruthy();
  });

  it("renders navigation and inventory content", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    expect(screen.getByRole("link", { name: "Fridge" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Freezer" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Pantry" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Shopping List" })).toBeTruthy();

    expect(
      screen.getByRole("heading", { name: /Fridge/, level: 2 }),
    ).toBeTruthy();
    expect(
      screen.getAllByRole("heading", { name: /Freezer/, level: 2 }),
    ).toHaveLength(1);
    expect(
      screen.getByRole("heading", { name: /Pantry/, level: 2 }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: /Shopping List/, level: 2 }),
    ).toBeTruthy();
  });

  it("loads without console errors", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      render(
        <InventoryProvider>
          <App />
        </InventoryProvider>,
      );
      act(() => vi.runAllTimers());
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});

// ---------------------------------------------------------------------------
// M2 – Archive integration tests
// ---------------------------------------------------------------------------
describe("App – archive behavior", () => {
  it("clicking Archive removes item from its location section", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    fireEvent.change(screen.getByLabelText("Search:"), {
      target: { value: "Pearl Couscous" },
    });
    act(() => vi.runAllTimers());

    // Pearl Couscous is in Pantry
    const pantrySection = screen
      .getByRole("heading", { name: /Pantry/i, level: 2 })
      .closest("section");
    expect(within(pantrySection).getByText("Pearl Couscous")).toBeTruthy();

    // Find the Pearl Couscous article and click Archive
    const article = within(pantrySection)
      .getByRole("heading", { name: "Pearl Couscous", level: 2 })
      .closest("article");
    fireEvent.click(within(article).getByRole("button", { name: "Archive" }));

    // Pearl Couscous should no longer appear in the Pantry section
    expect(within(pantrySection).queryByText("Pearl Couscous")).toBeNull();
  });

  it("archived item appears in Archived Items section", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    // Archive Apple Sauce from Fridge
    const fridgeSection = screen
      .getByRole("heading", { name: /Fridge/i, level: 2 })
      .closest("section");
    const article = within(fridgeSection)
      .getByRole("heading", { name: "Apple Sauce", level: 2 })
      .closest("article");
    fireEvent.click(within(article).getByRole("button", { name: "Archive" }));

    // Click the toggle button to reveal the Archived Items section
    fireEvent.click(
      screen.getByRole("button", { name: /Show Archived Items/i }),
    );

    // Now expand the collapsed section inside InventorySection
    const archivedSection = screen
      .getByRole("heading", { name: /Archived Items/i, level: 2 })
      .closest("section");
    const toggle = within(archivedSection).getByRole("button", {
      name: /Show Collapsed|Collapse/i,
    });
    if (toggle.getAttribute("aria-expanded") === "false") {
      fireEvent.click(toggle);
    }

    expect(within(archivedSection).getByText("Apple Sauce")).toBeTruthy();
  });

  it("archiving a shopping list item removes it from Shopping List section", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    fireEvent.change(screen.getByLabelText("Search:"), {
      target: { value: "Sesame Oil" },
    });
    act(() => vi.runAllTimers());

    // Sesame Oil is already on shopping list (NeedRestock=true, TargetQty=1 > QtyOnHand=0.1)
    const shoppingSection = screen
      .getByRole("heading", { name: /Shopping List/i, level: 2 })
      .closest("section");
    expect(within(shoppingSection).getByText("Sesame Oil")).toBeTruthy();

    // Archive Sesame Oil from the Pantry section
    const pantrySection = screen
      .getByRole("heading", { name: /Pantry/i, level: 2 })
      .closest("section");
    const article = within(pantrySection)
      .getByRole("heading", { name: "Sesame Oil", level: 2 })
      .closest("article");
    fireEvent.click(within(article).getByRole("button", { name: "Archive" }));

    // Sesame Oil should be gone from Shopping List
    expect(within(shoppingSection).queryByText("Sesame Oil")).toBeNull();
  });

  it("Archived Items toggle is visible when archived items exist", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    const fridgeSection = screen
      .getByRole("heading", { name: /Fridge/i, level: 2 })
      .closest("section");
    const article = within(fridgeSection)
      .getByRole("heading", { name: "Apple Sauce", level: 2 })
      .closest("article");
    fireEvent.click(within(article).getByRole("button", { name: "Archive" }));

    expect(
      screen.getByRole("button", { name: /Show Archived Items/i }),
    ).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// M2 – Delete integration tests
// ---------------------------------------------------------------------------
describe("App – delete behavior", () => {
  it("clicking Delete + confirming removes item from section", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());
    const fridgeSection = screen
      .getByRole("heading", { name: /Fridge/i, level: 2 })
      .closest("section");
    expect(within(fridgeSection).getByText("Apple Sauce")).toBeTruthy();
    const article = within(fridgeSection)
      .getByRole("heading", { name: "Apple Sauce", level: 2 })
      .closest("article");
    fireEvent.click(within(article).getByRole("button", { name: "Delete" }));
    // Confirm dialog should appear
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(within(fridgeSection).queryByText("Apple Sauce")).toBeNull();
  });
  it("clicking Delete + cancelling keeps item in section", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());
    const fridgeSection = screen
      .getByRole("heading", { name: /Fridge/i, level: 2 })
      .closest("section");
    const article = within(fridgeSection)
      .getByRole("heading", { name: "Apple Sauce", level: 2 })
      .closest("article");
    fireEvent.click(within(article).getByRole("button", { name: "Delete" }));
    // Cancel dialog
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    // Item should still be there
    expect(within(fridgeSection).getByText("Apple Sauce")).toBeTruthy();
  });
  it("deleting visible fridge items removes them while keeping the section valid", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());
    const fridgeSection = screen
      .getByRole("heading", { name: /Fridge/i, level: 2 })
      .closest("section");
    // Fridge has 2 items: Low Fat Vanilla Yogurt and Apple Sauce
    // Delete both
    const yogurtArticle = within(fridgeSection)
      .getByRole("heading", { name: "Low Fat Vanilla Yogurt", level: 2 })
      .closest("article");
    fireEvent.click(
      within(yogurtArticle).getByRole("button", { name: "Delete" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    const appleArticle = within(fridgeSection)
      .getByRole("heading", { name: "Apple Sauce", level: 2 })
      .closest("article");
    fireEvent.click(
      within(appleArticle).getByRole("button", { name: "Delete" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(
      within(fridgeSection).queryByText("Low Fat Vanilla Yogurt"),
    ).toBeNull();
    expect(within(fridgeSection).queryByText("Apple Sauce")).toBeNull();
    expect(
      screen.getByRole("heading", { name: /^Fridge \(/, level: 2 }),
    ).toBeTruthy();
  });
});

describe("App – pagination behavior", () => {
  it("resets pantry pagination when search reduces the section to one page", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    const addForm = screen.getByRole("form", {
      name: "Quick add inventory item",
    });

    for (let index = 1; index <= 11; index += 1) {
      addQuickItem(addForm, `Pantry Seed ${String(index).padStart(2, "0")}`);
    }

    fireEvent.change(screen.getByLabelText("Search:"), {
      target: { value: "Pantry Seed" },
    });
    act(() => vi.runAllTimers());

    let pantrySection = screen
      .getByRole("heading", { name: /^Pantry \(/, level: 2 })
      .closest("section");

    fireEvent.change(within(pantrySection).getByLabelText("Items per page:"), {
      target: { value: "5" },
    });
    fireEvent.click(
      within(pantrySection).getByRole("button", { name: "Next page" }),
    );
    fireEvent.click(
      within(pantrySection).getByRole("button", { name: "Next page" }),
    );

    expect(within(pantrySection).getByText("Page 3 of 3")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Search:"), {
      target: { value: "Pantry Seed 01" },
    });
    act(() => vi.runAllTimers());

    pantrySection = screen
      .getByRole("heading", { name: /^Pantry \(/, level: 2 })
      .closest("section");

    expect(
      screen.getByRole("heading", {
        name: "Pantry (1 item, page 1 of 1)",
        level: 2,
      }),
    ).toBeTruthy();
    expect(within(pantrySection).getByText("Pantry Seed 01")).toBeTruthy();
    expect(
      within(pantrySection).queryByRole("button", { name: "Next page" }),
    ).toBeNull();
  });

  it("moves to the previous pantry page when deleting the last item on the current page", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    const addForm = screen.getByRole("form", {
      name: "Quick add inventory item",
    });

    for (let index = 1; index <= 11; index += 1) {
      addQuickItem(addForm, `Pantry Seed ${String(index).padStart(2, "0")}`);
    }

    fireEvent.change(screen.getByLabelText("Search:"), {
      target: { value: "Pantry Seed" },
    });
    act(() => vi.runAllTimers());

    let pantrySection = screen
      .getByRole("heading", { name: /^Pantry \(/, level: 2 })
      .closest("section");

    fireEvent.change(within(pantrySection).getByLabelText("Items per page:"), {
      target: { value: "5" },
    });
    fireEvent.click(
      within(pantrySection).getByRole("button", { name: "Next page" }),
    );
    fireEvent.click(
      within(pantrySection).getByRole("button", { name: "Next page" }),
    );

    const lastPageArticle = within(pantrySection)
      .getByRole("heading", { name: "Pantry Seed 11", level: 2 })
      .closest("article");
    fireEvent.click(
      within(lastPageArticle).getByRole("button", { name: "Delete" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    pantrySection = screen
      .getByRole("heading", { name: /^Pantry \(/, level: 2 })
      .closest("section");

    expect(within(pantrySection).getByText("Page 2 of 2")).toBeTruthy();
    expect(within(pantrySection).queryByText("Pantry Seed 11")).toBeNull();
    expect(within(pantrySection).getByText("Pantry Seed 06")).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// M2 – Field visibility integration tests
// ---------------------------------------------------------------------------
describe("App – field visibility", () => {
  it("default fields are visible on item cards on initial render", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    fireEvent.change(screen.getByLabelText("Search:"), {
      target: { value: "Pearl Couscous" },
    });
    act(() => vi.runAllTimers());

    // Pearl Couscous has Brand="Rice Select" — Brand is a default visible field
    expect(screen.getByText("Brand: Rice Select")).toBeTruthy();
    // Category is also default visible
    expect(screen.getByText("Category: Dry")).toBeTruthy();
  });

  it("toggling a field off via FieldSelector hides it from the card", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    // Open FieldSelector via nav (aria-label is "Select visible fields")
    fireEvent.click(
      screen.getByRole("button", { name: "Select visible fields" }),
    );

    // Uncheck "Brand"
    const brandCheckbox = screen.getByRole("checkbox", { name: "Brand" });
    expect(brandCheckbox.checked).toBe(true);
    fireEvent.click(brandCheckbox);

    // Close the dialog
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    fireEvent.change(screen.getByLabelText("Search:"), {
      target: { value: "Pearl Couscous" },
    });
    act(() => vi.runAllTimers());

    // Brand field should no longer appear on cards
    expect(screen.queryByText("Brand: Rice Select")).toBeNull();
  });

  it("toggling a field on shows it on the card", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    // "Notes" is not in default visible fields — should not appear
    expect(screen.queryByText(/^Notes:/)).toBeNull();

    // Open FieldSelector
    fireEvent.click(
      screen.getByRole("button", { name: "Select visible fields" }),
    );

    // Check "Notes" on
    const notesCb = screen.getByRole("checkbox", { name: "Notes" });
    expect(notesCb.checked).toBe(false);
    fireEvent.click(notesCb);

    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    // Notes would show if any item has a non-empty Notes value.
    // Sample items all have Notes: null, so nothing to show — that's correct behavior.
    // Instead verify a field that has data: toggle on "Sub-Category"
    fireEvent.click(
      screen.getByRole("button", { name: "Select visible fields" }),
    );
    const subCatCb = screen.getByRole("checkbox", { name: "Sub-Category" });
    fireEvent.click(subCatCb);
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    fireEvent.change(screen.getByLabelText("Search:"), {
      target: { value: "Sesame Oil" },
    });
    act(() => vi.runAllTimers());

    // Sesame Oil has SubCategory="Oils"
    expect(screen.getByText("Sub-Category: Oils")).toBeTruthy();
  });

  it("ItemName always remains visible regardless of field selector state", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    // Open FieldSelector
    fireEvent.click(
      screen.getByRole("button", { name: "Select visible fields" }),
    );

    // ItemName checkbox should be disabled
    const itemNameCb = screen.getByRole("checkbox", { name: "Item Name" });
    expect(itemNameCb.disabled).toBe(true);
    expect(itemNameCb.checked).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    fireEvent.change(screen.getByLabelText("Search:"), {
      target: { value: "Pearl Couscous" },
    });
    act(() => vi.runAllTimers());

    // Item names still visible
    expect(
      screen.getByRole("heading", { name: "Pearl Couscous", level: 2 }),
    ).toBeTruthy();
  });

  it("Reset to Defaults restores original visible field set", () => {
    render(
      <InventoryProvider>
        <App />
      </InventoryProvider>,
    );
    act(() => vi.runAllTimers());

    // First, toggle Brand off
    fireEvent.click(
      screen.getByRole("button", { name: "Select visible fields" }),
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Brand" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(screen.queryByText("Brand: Rice Select")).toBeNull();

    // Now reset
    fireEvent.click(
      screen.getByRole("button", { name: "Select visible fields" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Reset to Defaults" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    fireEvent.change(screen.getByLabelText("Search:"), {
      target: { value: "Pearl Couscous" },
    });
    act(() => vi.runAllTimers());

    // Brand should be back
    expect(screen.getByText("Brand: Rice Select")).toBeTruthy();
  });
});
