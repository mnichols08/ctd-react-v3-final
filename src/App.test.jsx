import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";

import App from "./App";

afterEach(() => {
  cleanup();
});

describe("App", () => {
  it("renders header, inventory, and footer sections", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Kitchen Inventory", level: 1 }),
    ).toBeTruthy();
    expect(screen.getByRole("main")).toBeTruthy();
    expect(screen.getByRole("contentinfo")).toBeTruthy();
  });

  it("renders navigation and inventory content", () => {
    render(<App />);

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
      render(<App />);
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
    render(<App />);

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
    render(<App />);

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
    const toggle = archivedSection.querySelector("a[aria-expanded]");
    if (toggle && toggle.getAttribute("aria-expanded") === "false") {
      fireEvent.click(toggle);
    }

    expect(within(archivedSection).getByText("Apple Sauce")).toBeTruthy();
  });

  it("archiving a shopping list item removes it from Shopping List section", () => {
    render(<App />);

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

  it("Archived Items nav link is visible when archived items exist", () => {
    render(<App />);

    // Sample data includes an archived item so the link should already be there
    expect(screen.getByRole("link", { name: "Archived Items" })).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// M2 – Delete integration tests
// ---------------------------------------------------------------------------
describe("App – delete behavior", () => {
  it("clicking Delete + confirming removes item from section", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    try {
      render(<App />);
      const fridgeSection = screen
        .getByRole("heading", { name: /Fridge/i, level: 2 })
        .closest("section");
      expect(within(fridgeSection).getByText("Apple Sauce")).toBeTruthy();
      const article = within(fridgeSection)
        .getByRole("heading", { name: "Apple Sauce", level: 2 })
        .closest("article");
      fireEvent.click(within(article).getByRole("button", { name: "Delete" }));
      expect(window.confirm).toHaveBeenCalled();
      expect(within(fridgeSection).queryByText("Apple Sauce")).toBeNull();
    } finally {
      confirmSpy.mockRestore();
    }
  });
  it("clicking Delete + cancelling keeps item in section", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    try {
      render(<App />);
      const fridgeSection = screen
        .getByRole("heading", { name: /Fridge/i, level: 2 })
        .closest("section");
      const article = within(fridgeSection)
        .getByRole("heading", { name: "Apple Sauce", level: 2 })
        .closest("article");
      fireEvent.click(within(article).getByRole("button", { name: "Delete" }));
      expect(window.confirm).toHaveBeenCalled();
      // Item should still be there
      expect(within(fridgeSection).getByText("Apple Sauce")).toBeTruthy();
    } finally {
      confirmSpy.mockRestore();
    }
  });
  it("deleting all items in a section shows EmptyState", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    try {
      render(<App />);
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
      const appleArticle = within(fridgeSection)
        .getByRole("heading", { name: "Apple Sauce", level: 2 })
        .closest("article");
      fireEvent.click(
        within(appleArticle).getByRole("button", { name: "Delete" }),
      );
      // EmptyState should now render for fridge
      expect(
        within(fridgeSection).getByText(
          "Items in the fridge will be listed here.",
        ),
      ).toBeTruthy();
    } finally {
      confirmSpy.mockRestore();
    }
  });
});

// ---------------------------------------------------------------------------
// M2 – Field visibility integration tests
// ---------------------------------------------------------------------------
describe("App – field visibility", () => {
  it("default fields are visible on item cards on initial render", () => {
    render(<App />);

    // Pearl Couscous has Brand="Rice Select" — Brand is a default visible field
    expect(screen.getByText("Brand: Rice Select")).toBeTruthy();
    // Category is also default visible
    expect(screen.getByText("Category: Dry")).toBeTruthy();
  });

  it("toggling a field off via FieldSelector hides it from the card", () => {
    render(<App />);

    // Open FieldSelector via nav (aria-label is "Select visible fields")
    fireEvent.click(
      screen.getByRole("link", { name: "Select visible fields" }),
    );

    // Uncheck "Brand"
    const brandCheckbox = screen.getByRole("checkbox", { name: "Brand" });
    expect(brandCheckbox.checked).toBe(true);
    fireEvent.click(brandCheckbox);

    // Close the dialog
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    // Brand field should no longer appear on cards
    expect(screen.queryByText("Brand: Rice Select")).toBeNull();
    expect(screen.queryByText("Brand: Dabur")).toBeNull();
  });

  it("toggling a field on shows it on the card", () => {
    render(<App />);

    // "Notes" is not in default visible fields — should not appear
    expect(screen.queryByText(/^Notes:/)).toBeNull();

    // Open FieldSelector
    fireEvent.click(
      screen.getByRole("link", { name: "Select visible fields" }),
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
      screen.getByRole("link", { name: "Select visible fields" }),
    );
    const subCatCb = screen.getByRole("checkbox", { name: "Sub-Category" });
    fireEvent.click(subCatCb);
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    // Sesame Oil has SubCategory="Oils"
    expect(screen.getByText("Sub-Category: Oils")).toBeTruthy();
  });

  it("ItemName always remains visible regardless of field selector state", () => {
    render(<App />);

    // Open FieldSelector
    fireEvent.click(
      screen.getByRole("link", { name: "Select visible fields" }),
    );

    // ItemName checkbox should be disabled
    const itemNameCb = screen.getByRole("checkbox", { name: "Item Name" });
    expect(itemNameCb.disabled).toBe(true);
    expect(itemNameCb.checked).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    // Item names still visible
    expect(
      screen.getByRole("heading", { name: "Pearl Couscous", level: 2 }),
    ).toBeTruthy();
    expect(
      screen.getAllByRole("heading", { name: "Sesame Oil", level: 2 }).length,
    ).toBeGreaterThan(0);
  });

  it("Reset to Defaults restores original visible field set", () => {
    render(<App />);

    // First, toggle Brand off
    fireEvent.click(
      screen.getByRole("link", { name: "Select visible fields" }),
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Brand" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(screen.queryByText("Brand: Rice Select")).toBeNull();

    // Now reset
    fireEvent.click(
      screen.getByRole("link", { name: "Select visible fields" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Reset to Defaults" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    // Brand should be back
    expect(screen.getByText("Brand: Rice Select")).toBeTruthy();
  });
});
