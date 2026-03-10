import { afterEach, describe, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";

import InventorySection from "./InventorySection.component";
import { InventoryProvider } from "../../context/InventoryProvider";

afterEach(() => {
  cleanup();
});

// Minimal items for section tests
const makeItems = (
  count,
  { prefix = "Item", location = "Pantry", startId = 1 } = {},
) =>
  Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    ItemName: `${prefix} ${i + 1}`,
    QtyOnHand: 1,
    QtyUnit: "ea",
    TargetQty: 1,
    NeedRestock: false,
    Category: "Test",
    Location: location,
  }));

// ---------------------------------------------------------------------------
// Collapsible section tests
// ---------------------------------------------------------------------------
describe("InventorySection – collapsible behavior", () => {
  it("non-archived sections render expanded by default", () => {
    render(
      <InventoryProvider>
        <InventorySection id="pantry" title="Pantry" items={makeItems(2)} />
      </InventoryProvider>,
    );

    const section = screen
      .getByRole("heading", { name: /Pantry/, level: 2 })
      .closest("section");
    // Toggle button should say "Collapse" and aria-expanded should be true
    const toggle = within(section).getByRole("button", { name: "Collapse" });
    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(toggle.textContent).toBe("Collapse");

    // Items should be visible
    expect(within(section).getByText("Item 1")).toBeTruthy();
    expect(within(section).getByText("Item 2")).toBeTruthy();
  });

  it("archived section renders collapsed by default", () => {
    render(
      <InventoryProvider>
        <InventorySection
          id="archived"
          title="Archived Items"
          items={makeItems(1)}
        />
      </InventoryProvider>,
    );

    const section = screen
      .getByRole("heading", { name: /Archived Items/, level: 2 })
      .closest("section");
    const toggle = within(section).getByRole("button", {
      name: "Show Collapsed",
    });
    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(within(section).getByText("Collapsed")).toBeTruthy();
    // Item heading should NOT be visible when collapsed
    expect(within(section).queryByText("Item 1")).toBeNull();
  });

  it("clicking toggle hides the item list", () => {
    render(
      <InventoryProvider>
        <InventorySection id="fridge" title="Fridge" items={makeItems(2)} />
      </InventoryProvider>,
    );

    const section = screen
      .getByRole("heading", { name: /Fridge/, level: 2 })
      .closest("section");
    const toggle = within(section).getByRole("button", { name: "Collapse" });

    // Verify expanded
    expect(within(section).getByText("Item 1")).toBeTruthy();

    // Click the toggle
    fireEvent.click(toggle);

    // Now collapsed
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(within(section).getByText("Collapsed")).toBeTruthy();
    expect(within(section).queryByText("Item 1")).toBeNull();
  });

  it("clicking toggle again shows the item list", () => {
    render(
      <InventoryProvider>
        <InventorySection id="fridge" title="Fridge" items={makeItems(2)} />
      </InventoryProvider>,
    );

    const section = screen
      .getByRole("heading", { name: /Fridge/, level: 2 })
      .closest("section");
    const toggle = within(section).getByRole("button", { name: "Collapse" });

    // Collapse
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    // Expand again
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(within(section).getByText("Item 1")).toBeTruthy();
    expect(within(section).getByText("Item 2")).toBeTruthy();
  });

  it("item count remains visible in heading when collapsed", () => {
    render(
      <InventoryProvider>
        <InventorySection id="pantry" title="Pantry" items={makeItems(3)} />
      </InventoryProvider>,
    );

    const section = screen
      .getByRole("heading", { name: /Pantry/, level: 2 })
      .closest("section");
    // Collapse
    fireEvent.click(within(section).getByRole("button", { name: "Collapse" }));

    // Heading still shows count
    const heading = screen.getByRole("heading", { name: /Pantry/, level: 2 });
    expect(heading.textContent).toContain("(3 items, page 1 of 1)");
  });

  it("collapsing one section does not affect another", () => {
    const { container } = render(
      <InventoryProvider>
        <div>
          <InventorySection id="fridge" title="Fridge" items={makeItems(1)} />
          <InventorySection id="pantry" title="Pantry" items={makeItems(1)} />
        </div>
      </InventoryProvider>,
    );

    const sections = container.querySelectorAll("section");
    const fridgeSection = sections[0];
    const pantrySection = sections[1];

    // Collapse fridge
    const fridgeToggle = fridgeSection.querySelector("button[aria-expanded]");
    fireEvent.click(fridgeToggle);

    expect(fridgeToggle.getAttribute("aria-expanded")).toBe("false");

    // Pantry should still be expanded
    const pantryToggle = pantrySection.querySelector("button[aria-expanded]");
    expect(pantryToggle.getAttribute("aria-expanded")).toBe("true");
    expect(within(pantrySection).getByText("Item 1")).toBeTruthy();
  });

  it("shows EmptyState when items array is empty", () => {
    const { container } = render(
      <InventoryProvider>
        <InventorySection id="freezer" title="Freezer" items={[]} />
      </InventoryProvider>,
    );

    expect(
      screen.getByText("Items in the freezer will be listed here."),
    ).toBeTruthy();
    // Toggle button should not render at all when empty
    expect(container.querySelector("button[aria-expanded]")).toBeNull();
    expect(screen.queryByText("Collapse")).toBeNull();
    expect(screen.queryByText("Show Collapsed")).toBeNull();
  });
});

describe("InventorySection – pagination behavior", () => {
  it("renders the first page of items and a page summary in the heading", () => {
    render(
      <InventoryProvider>
        <InventorySection id="pantry" title="Pantry" items={makeItems(12)} />
      </InventoryProvider>,
    );

    const section = screen
      .getByRole("heading", { name: /Pantry/, level: 2 })
      .closest("section");

    expect(within(section).getByText("Item 1")).toBeTruthy();
    expect(within(section).getByText("Item 10")).toBeTruthy();
    expect(within(section).queryByText("Item 11")).toBeNull();
    expect(within(section).getByText("Page 1 of 2")).toBeTruthy();
    expect(
      screen.getByRole("heading", {
        name: "Pantry (12 items, page 1 of 2)",
        level: 2,
      }),
    ).toBeTruthy();
  });

  it("navigates to the next page without affecting visible items from the first page", () => {
    render(
      <InventoryProvider>
        <InventorySection id="pantry" title="Pantry" items={makeItems(12)} />
      </InventoryProvider>,
    );

    const section = screen
      .getByRole("heading", { name: /Pantry/, level: 2 })
      .closest("section");

    fireEvent.click(within(section).getByRole("button", { name: "Next page" }));

    expect(within(section).queryByText("Item 1")).toBeNull();
    expect(within(section).getByText("Item 11")).toBeTruthy();
    expect(within(section).getByText("Item 12")).toBeTruthy();
    expect(within(section).getByText("Page 2 of 2")).toBeTruthy();
  });

  it("changes page size per section and resets that section to page 1", () => {
    render(
      <InventoryProvider>
        <InventorySection id="pantry" title="Pantry" items={makeItems(12)} />
      </InventoryProvider>,
    );

    const section = screen
      .getByRole("heading", { name: /Pantry/, level: 2 })
      .closest("section");

    fireEvent.click(within(section).getByRole("button", { name: "Next page" }));
    fireEvent.change(within(section).getByLabelText("Items per page:"), {
      target: { value: "5" },
    });

    expect(within(section).getByText("Page 1 of 3")).toBeTruthy();
    expect(within(section).getByText("Item 1")).toBeTruthy();
    expect(within(section).getByText("Item 5")).toBeTruthy();
    expect(within(section).queryByText("Item 6")).toBeNull();
  });

  it("hides pagination controls when all items fit on one page", () => {
    render(
      <InventoryProvider>
        <InventorySection id="pantry" title="Pantry" items={makeItems(10)} />
      </InventoryProvider>,
    );

    const section = screen
      .getByRole("heading", { name: /Pantry/, level: 2 })
      .closest("section");

    expect(
      within(section).queryByRole("button", { name: "Next page" }),
    ).toBeNull();
    expect(within(section).queryByLabelText("Items per page:")).toBeNull();
  });

  it("keeps pagination state independent between sections", () => {
    render(
      <InventoryProvider>
        <div>
          <InventorySection
            id="fridge"
            title="Fridge"
            items={makeItems(12, { prefix: "Fridge Item", location: "Fridge" })}
          />
          <InventorySection
            id="pantry"
            title="Pantry"
            items={makeItems(12, { prefix: "Pantry Item" })}
          />
        </div>
      </InventoryProvider>,
    );

    const fridgeSection = screen
      .getByRole("heading", { name: /^Fridge \(/, level: 2 })
      .closest("section");
    const pantrySection = screen
      .getByRole("heading", { name: /^Pantry \(/, level: 2 })
      .closest("section");

    fireEvent.click(
      within(fridgeSection).getByRole("button", { name: "Next page" }),
    );

    expect(within(fridgeSection).queryByText("Fridge Item 1")).toBeNull();
    expect(within(fridgeSection).getByText("Fridge Item 11")).toBeTruthy();
    expect(within(pantrySection).getByText("Pantry Item 1")).toBeTruthy();
    expect(within(pantrySection).queryByText("Pantry Item 11")).toBeNull();
  });

  it("clamps to the last valid page when the item count shrinks after rerender", () => {
    const { rerender } = render(
      <InventoryProvider>
        <InventorySection id="pantry" title="Pantry" items={makeItems(11)} />
      </InventoryProvider>,
    );

    let section = screen
      .getByRole("heading", { name: /Pantry/, level: 2 })
      .closest("section");

    fireEvent.click(within(section).getByRole("button", { name: "Next page" }));
    expect(within(section).getByText("Item 11")).toBeTruthy();

    rerender(
      <InventoryProvider>
        <InventorySection id="pantry" title="Pantry" items={makeItems(10)} />
      </InventoryProvider>,
    );

    section = screen
      .getByRole("heading", { name: /Pantry/, level: 2 })
      .closest("section");

    expect(
      screen.getByRole("heading", {
        name: "Pantry (10 items, page 1 of 1)",
        level: 2,
      }),
    ).toBeTruthy();
    expect(within(section).getByText("Item 1")).toBeTruthy();
    expect(within(section).queryByText("Item 11")).toBeNull();
  });

  it("moves to the previous valid page when the last item on a page is removed", () => {
    const { rerender } = render(
      <InventoryProvider>
        <InventorySection id="pantry" title="Pantry" items={makeItems(11)} />
      </InventoryProvider>,
    );

    let section = screen
      .getByRole("heading", { name: /Pantry/, level: 2 })
      .closest("section");

    fireEvent.change(within(section).getByLabelText("Items per page:"), {
      target: { value: "5" },
    });
    fireEvent.click(within(section).getByRole("button", { name: "Next page" }));
    fireEvent.click(within(section).getByRole("button", { name: "Next page" }));
    expect(within(section).getByText("Item 11")).toBeTruthy();

    rerender(
      <InventoryProvider>
        <InventorySection id="pantry" title="Pantry" items={makeItems(10)} />
      </InventoryProvider>,
    );

    section = screen
      .getByRole("heading", { name: /Pantry/, level: 2 })
      .closest("section");

    expect(within(section).getByText("Page 2 of 2")).toBeTruthy();
    expect(within(section).getByText("Item 6")).toBeTruthy();
    expect(within(section).queryByText("Item 11")).toBeNull();
  });
});
