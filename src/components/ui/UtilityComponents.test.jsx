import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
  const FIXED_NOW = new Date("2026-03-10T00:00:00").getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders quick stat labels and values", () => {
    const inventoryItems = inventorySampleData.records;
    const activeItems = inventoryItems.filter(
      (item) => item.Status !== "archived",
    );
    const expirationThresholdMs = 14 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const expectedTotalItems = activeItems.length;
    const expectedExpiringSoon = activeItems.filter((item) => {
      if (!item.ExpiresOn) return false;
      const timeUntilExpiration =
        new Date(item.ExpiresOn).getTime() - now.getTime();
      if (Number.isNaN(timeUntilExpiration)) return false;
      return timeUntilExpiration >= 0 && timeUntilExpiration < expirationThresholdMs;
    }).length;
    const expectedLowStock = activeItems.filter(
      (item) => item.QtyOnHand < 5,
    ).length;
    const expectedCategories = new Set(activeItems.map((item) => item.Category))
      .size;
    const expectedArchivedItems = inventoryItems.filter(
      (item) => item.Status === "archived",
    ).length;

    render(<QuickStatsBar inventoryItems={inventoryItems} />);

    const totalHeading = screen.getByRole("heading", {
      name: "Active Items",
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
