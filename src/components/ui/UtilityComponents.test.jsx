import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import EmptyState from "./EmptyState.component";
import QuickStatsBar from "./QuickStatsBar.component";
import inventorySampleData from "../../data/inventorySample.json";

afterEach(() => {
  cleanup();
});

describe("EmptyState", () => {
  it("renders a contextual empty-state message", () => {
    render(<EmptyState title="pantry" />);

    expect(
      screen.getByText("Items in the pantry will be listed here."),
    ).toBeTruthy();
  });
});

describe("QuickStatsBar", () => {
  it("renders quick stat labels and values", () => {
    const inventoryItems = inventorySampleData.records;
    const expectedTotalItems = inventoryItems.length;
    const expectedExpiringSoon = inventoryItems.filter(
      (item) => new Date(item.ExpiresOn) - new Date() < 7 * 24 * 60 * 60 * 1000,
    ).length;
    const expectedLowStock = inventoryItems.filter(
      (item) => item.QtyOnHand < 5,
    ).length;
    const expectedCategories = new Set(
      inventoryItems.map((item) => item.Category),
    ).size;
    const expectedArchivedItems = inventoryItems.filter(
      (item) => item.Status === "archived",
    ).length;

    render(<QuickStatsBar inventoryItems={inventoryItems} />);

    const totalHeading = screen.getByRole("heading", {
      name: "Total Items",
      level: 3,
    });
    const expiringHeading = screen.getByRole("heading", {
      name: "Expiring Soon",
      level: 3,
    });
    const lowStockHeading = screen.getByRole("heading", {
      name: "Low Stock",
      level: 3,
    });
    const categoriesHeading = screen.getByRole("heading", {
      name: "Categories",
      level: 3,
    });
    const archivedHeading = screen.getByRole("heading", {
      name: "Archived Items",
      level: 3,
    });

    expect(totalHeading.nextElementSibling?.textContent).toBe(
      String(expectedTotalItems),
    );
    expect(expiringHeading.nextElementSibling?.textContent).toBe(
      String(expectedExpiringSoon),
    );
    expect(lowStockHeading.nextElementSibling?.textContent).toBe(
      String(expectedLowStock),
    );
    expect(categoriesHeading.nextElementSibling?.textContent).toBe(
      String(expectedCategories),
    );
    expect(archivedHeading.nextElementSibling?.textContent).toBe(
      String(expectedArchivedItems),
    );
  });
});
