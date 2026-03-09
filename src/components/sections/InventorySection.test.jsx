import { afterEach, describe, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";

import InventorySection from "./InventorySection.component";

afterEach(() => {
  cleanup();
});

// Minimal items for section tests
const makeItems = (count) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    ItemName: `Item ${i + 1}`,
    QtyOnHand: 1,
    QtyUnit: "ea",
    TargetQty: 1,
    NeedRestock: false,
    Category: "Test",
    Location: "Pantry",
  }));

// ---------------------------------------------------------------------------
// Collapsible section tests
// ---------------------------------------------------------------------------
describe("InventorySection – collapsible behavior", () => {
  it("non-archived sections render expanded by default", () => {
    const { container } = render(
      <InventorySection id="pantry" title="Pantry" items={makeItems(2)} />,
    );

    // Toggle button should say "Collapse" and aria-expanded should be true
    const toggle = container.querySelector("button[aria-expanded]");
    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(toggle.textContent).toBe("Collapse");

    // Items should be visible
    expect(screen.getByText("Item 1")).toBeTruthy();
    expect(screen.getByText("Item 2")).toBeTruthy();
  });

  it("archived section renders collapsed by default", () => {
    const { container } = render(
      <InventorySection
        id="archived"
        title="Archived Items"
        items={makeItems(1)}
      />,
    );

    const toggle = container.querySelector("button[aria-expanded]");
    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByText("Collapsed")).toBeTruthy();
    // Item heading should NOT be visible when collapsed
    expect(
      screen.queryByRole("heading", { name: "Item 1", level: 2 }),
    ).toBeNull();
  });

  it("clicking toggle hides the item list", () => {
    const { container } = render(
      <InventorySection id="fridge" title="Fridge" items={makeItems(2)} />,
    );

    const toggle = container.querySelector("button[aria-expanded]");

    // Verify expanded
    expect(screen.getByText("Item 1")).toBeTruthy();

    // Click the toggle
    fireEvent.click(toggle);

    // Now collapsed
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByText("Collapsed")).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "Item 1", level: 2 }),
    ).toBeNull();
  });

  it("clicking toggle again shows the item list", () => {
    const { container } = render(
      <InventorySection id="fridge" title="Fridge" items={makeItems(2)} />,
    );

    const toggle = container.querySelector("button[aria-expanded]");

    // Collapse
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    // Expand again
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Item 1")).toBeTruthy();
    expect(screen.getByText("Item 2")).toBeTruthy();
  });

  it("item count remains visible in heading when collapsed", () => {
    const { container } = render(
      <InventorySection id="pantry" title="Pantry" items={makeItems(3)} />,
    );

    // Collapse
    fireEvent.click(container.querySelector("button[aria-expanded]"));

    // Heading still shows count
    const heading = screen.getByRole("heading", { name: /Pantry/, level: 2 });
    expect(heading.textContent).toContain("(3)");
  });

  it("collapsing one section does not affect another", () => {
    const { container } = render(
      <div>
        <InventorySection id="fridge" title="Fridge" items={makeItems(1)} />
        <InventorySection id="pantry" title="Pantry" items={makeItems(1)} />
      </div>,
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
      <InventorySection id="freezer" title="Freezer" items={[]} />,
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
