import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import EmptyState from "./EmptyState.component";
import QuickStatsBar from "./QuickStatsBar.component";
import { InventoryContext } from "../../context/InventoryContext";
import inventorySampleData from "../../data/inventorySample.json";

function renderWithContext(ui, contextOverrides = {}) {
  const defaultCtx = {
    items: [],
    filterAppliedItems: [],
    searchTerm: "",
    activeFilterCount: 0,
    lastFetchedAt: null,
  };
  return render(
    <InventoryContext.Provider value={{ ...defaultCtx, ...contextOverrides }}>
      {ui}
    </InventoryContext.Provider>,
  );
}

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
  const EXPIRATION_THRESHOLD_MS = 14 * 24 * 60 * 60 * 1000; // matches EXPIRING_SOON_MS

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
    const now = new Date();
    const todayUTC = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    );
    const expectedTotalItems = activeItems.length;
    const expectedNeedRestock = activeItems.filter(
      (item) => item.NeedRestock === true,
    ).length;
    const expectedExpiringSoon = activeItems.filter((item) => {
      if (!item.ExpiresOn) return false;
      const expiresAt = new Date(item.ExpiresOn).getTime();
      if (Number.isNaN(expiresAt)) return false;
      const timeUntilExpiration = expiresAt - todayUTC;
      return (
        timeUntilExpiration >= 0 &&
        timeUntilExpiration < EXPIRATION_THRESHOLD_MS
      );
    }).length;
    const expectedShoppingList = activeItems.filter(
      (item) => item.NeedRestock === true && item.TargetQty > item.QtyOnHand,
    ).length;

    renderWithContext(<QuickStatsBar />, {
      items: inventoryItems,
      filterAppliedItems: inventoryItems,
    });

    const totalHeading = screen.getByRole("heading", {
      name: "Total Items",
      level: 3,
    });
    const restockHeading = screen.getByRole("heading", {
      name: "Need Restock",
      level: 3,
    });
    const expiringHeading = screen.getByRole("heading", {
      name: "Expiring Soon",
      level: 3,
    });
    const shoppingHeading = screen.getByRole("heading", {
      name: "Shopping List",
      level: 3,
    });

    expect(totalHeading.nextElementSibling?.textContent).toBe(
      String(expectedTotalItems),
    );
    expect(restockHeading.nextElementSibling?.textContent).toBe(
      String(expectedNeedRestock),
    );
    expect(expiringHeading.nextElementSibling?.textContent).toBe(
      String(expectedExpiringSoon),
    );
    expect(shoppingHeading.nextElementSibling?.textContent).toBe(
      String(expectedShoppingList),
    );
  });

  it("shows all zeros for empty inventory", () => {
    renderWithContext(<QuickStatsBar />);

    const totalHeading = screen.getByRole("heading", {
      name: "Total Items",
      level: 3,
    });
    expect(totalHeading.nextElementSibling?.textContent).toBe("0");

    const restockHeading = screen.getByRole("heading", {
      name: "Need Restock",
      level: 3,
    });
    expect(restockHeading.nextElementSibling?.textContent).toBe("0");

    const expiringHeading = screen.getByRole("heading", {
      name: "Expiring Soon",
      level: 3,
    });
    expect(expiringHeading.nextElementSibling?.textContent).toBe("0");

    const shoppingHeading = screen.getByRole("heading", {
      name: "Shopping List",
      level: 3,
    });
    expect(shoppingHeading.nextElementSibling?.textContent).toBe("0");
  });

  it("always uses full inventoryItems regardless of extra props", () => {
    const inventoryItems = inventorySampleData.records;
    const activeItems = inventoryItems.filter(
      (item) => item.Status !== "archived",
    );

    renderWithContext(<QuickStatsBar />, {
      items: inventoryItems,
      filterAppliedItems: inventoryItems,
    });

    expect(screen.queryByText("Showing stats for filtered items")).toBeNull();

    const totalHeading = screen.getByRole("heading", {
      name: "Total Items",
      level: 3,
    });
    expect(totalHeading.nextElementSibling?.textContent).toBe(
      String(activeItems.length),
    );
  });

  it("shows filtered stats when isFiltered is true", () => {
    const inventoryItems = inventorySampleData.records;
    const filteredItems = inventoryItems.filter(
      (item) => item.Category === "Dairy",
    );
    const activeFiltered = filteredItems.filter(
      (item) => item.Status !== "archived",
    );

    renderWithContext(<QuickStatsBar />, {
      items: inventoryItems,
      filterAppliedItems: filteredItems,
      activeFilterCount: 1,
    });

    expect(screen.getByText("Showing stats for filtered items")).toBeTruthy();

    const totalHeading = screen.getByRole("heading", {
      name: "Total Items",
      level: 3,
    });
    expect(totalHeading.nextElementSibling?.textContent).toBe(
      String(activeFiltered.length),
    );
  });
});
