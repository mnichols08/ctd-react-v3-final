import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { memo, useCallback, useEffect, useState } from "react";

import MainContainer from "./MainContainer.component";
import {
  InventoryActionsContext,
  InventoryDataContext,
  InventoryUIContext,
} from "../../context/InventoryContext";
import { InventoryProvider } from "../../context/InventoryProvider";
import inventorySampleData from "../../data/inventorySample.json";
import { fetchInventoryItems } from "../../data/airtableUtils";

vi.mock("../../data/airtableUtils", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchInventoryItems: vi.fn(),
  };
});

// Tracks every InventorySection render so useMemo tests can compare item refs
const sectionRenderLog = [];

vi.mock("../sections/ToolSection.component", () => ({
  default: ({ id, title, children }) => (
    <section id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

vi.mock("./QuickStatsBar.component", async () => {
  const { useInventoryData } = await import("../../context/InventoryContext");
  return {
    default: function MockQuickStatsBar() {
      const { items, filterAppliedItems } = useInventoryData();
      return (
        <div data-testid="quick-stats">
          QuickStatsBar
          <span data-testid="stats-total">{items?.length ?? 0}</span>
          <span data-testid="stats-filtered">
            {filterAppliedItems?.length ?? 0}
          </span>
        </div>
      );
    },
  };
});

vi.mock("../forms/FilterBarForm.component", async () => {
  const { useInventoryActions } =
    await import("../../context/InventoryContext");
  return {
    default: function MockFilterBarForm() {
      const { refetch, setSearch, setSort } = useInventoryActions();
      return (
        <div>
          FilterBarForm
          <button type="button" onClick={refetch}>
            Refresh
          </button>
          <input
            aria-label="mock-search"
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            aria-label="mock-sort-category-desc"
            onClick={() => setSort("Category", "desc")}
          >
            Sort
          </button>
        </div>
      );
    },
  };
});

vi.mock("../sections/InventorySection.component", async () => {
  const { useInventoryActions } =
    await import("../../context/InventoryContext");
  return {
    default: function MockInventorySection(props) {
      sectionRenderLog.push(props);
      const { addToShoppingList, updateTargetQty } = useInventoryActions();
      const { title, items, variant = "inventory" } = props;
      return (
        <section>
          <h2>{title}</h2>
          <p>{`count:${items.length}`}</p>
          <p>{items.map((item) => item.ItemName).join("|")}</p>
          <p>
            {items
              .map(
                (item) =>
                  `${item.ItemName}:${item.TargetQty}:${item.NeedRestock}`,
              )
              .join("|")}
          </p>
          {variant === "inventory" && items[0] && (
            <form
              aria-label={`mock-form-${title}`}
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                addToShoppingList?.(items[0].id, formData.get("quantity"));
              }}
            >
              <input
                aria-label={`mock-qty-${title}`}
                name="quantity"
                defaultValue="2"
              />
              <button type="submit">{`mock-add-${title}`}</button>
            </form>
          )}
          {variant === "shopping" && items[0] && (
            <button
              onClick={() => updateTargetQty?.(items[0].id, items[0].QtyOnHand)}
            >
              {`mock-remove-${title}`}
            </button>
          )}
        </section>
      );
    },
  };
});

afterEach(() => {
  cleanup();
  sectionRenderLog.length = 0;
});

// Wrapper that provides context via InventoryProvider, mirroring what App does
function TestMainContainer(props) {
  return (
    <InventoryProvider>
      <MainContainer {...props} />
    </InventoryProvider>
  );
}

function getLatestSectionProps(title) {
  return sectionRenderLog.filter((section) => section.title === title).pop();
}

function buildMockDataValue(
  items = inventorySampleData.records,
  overrides = {},
) {
  const activeItems = items.filter((item) => item.Status !== "archived");

  return {
    items: activeItems,
    isLoading: false,
    error: null,
    canLoadSampleDataFallback: false,
    lastFetchedAt: null,
    loadingProgress: null,
    partialLoadWarning: null,
    searchTerm: "",
    sortConfig: { field: "ItemName", direction: "asc" },
    filters: {
      categories: [],
      expiringSoon: false,
      lowStock: false,
    },
    filterAppliedItems: activeItems,
    activeFilterCount: 0,
    fridgeItems: activeItems.filter((item) => item.Location.includes("Fridge")),
    freezerItems: activeItems.filter((item) =>
      item.Location.includes("Freezer"),
    ),
    pantryItems: activeItems.filter((item) => item.Location.includes("Pantry")),
    shoppingListItems: activeItems.filter(
      (item) => item.NeedRestock && item.TargetQty > item.QtyOnHand,
    ),
    archivedItems: items.filter((item) => item.Status === "archived"),
    ...overrides,
  };
}

function buildMockUIValue(overrides = {}) {
  return {
    showQuickAdd: true,
    showArchived: false,
    isSaving: false,
    saveError: null,
    ...overrides,
  };
}

function buildMockActionsValue(overrides = {}) {
  return {
    addItem: vi.fn(),
    deleteItem: vi.fn(),
    updateItem: vi.fn(),
    archiveItem: vi.fn(),
    unarchiveItem: vi.fn(),
    refetch: vi.fn(),
    loadSampleDataFallback: vi.fn(),
    setSearch: vi.fn(),
    setSort: vi.fn(),
    setFilters: vi.fn(),
    clearFilters: vi.fn(),
    toggleField: vi.fn(),
    resetFields: vi.fn(),
    toggleQuickAdd: vi.fn(),
    toggleShowArchived: vi.fn(),
    dismissSaveError: vi.fn(),
    addToShoppingList: vi.fn(),
    removeFromShoppingList: vi.fn(),
    updateTargetQty: vi.fn(),
    ...overrides,
  };
}

function renderWithMockedInventoryContext({
  dataValue,
  uiValue = buildMockUIValue(),
  actionsValue = buildMockActionsValue(),
}) {
  return render(
    <InventoryDataContext.Provider value={dataValue}>
      <InventoryUIContext.Provider value={uiValue}>
        <InventoryActionsContext.Provider value={actionsValue}>
          <MainContainer />
        </InventoryActionsContext.Provider>
      </InventoryUIContext.Provider>
    </InventoryDataContext.Provider>,
  );
}

describe("MainContainer", () => {
  it("initializes state from sample data and passes filtered section items", () => {
    render(<TestMainContainer />);
    act(() => vi.runAllTimers());

    const fridgeSection = screen
      .getByRole("heading", { name: "Fridge" })
      .closest("section");
    const freezerSection = screen
      .getByRole("heading", { name: "Freezer" })
      .closest("section");
    const pantrySection = screen
      .getByRole("heading", { name: "Pantry" })
      .closest("section");
    const shoppingSection = screen
      .getByRole("heading", { name: "Shopping List" })
      .closest("section");

    expect(fridgeSection).toBeTruthy();
    expect(freezerSection).toBeTruthy();
    expect(pantrySection).toBeTruthy();
    expect(shoppingSection).toBeTruthy();

    const fridgeProps = getLatestSectionProps("Fridge");
    const freezerProps = getLatestSectionProps("Freezer");
    const pantryProps = getLatestSectionProps("Pantry");
    const shoppingProps = getLatestSectionProps("Shopping List");

    expect(fridgeSection?.textContent).toContain(
      `count:${fridgeProps.items.length}`,
    );
    expect(freezerSection?.textContent).toContain(
      `count:${freezerProps.items.length}`,
    );
    expect(pantrySection?.textContent).toContain(
      `count:${pantryProps.items.length}`,
    );
    expect(shoppingSection?.textContent).toContain(
      `count:${shoppingProps.items.length}`,
    );
  });

  it("submits an add-item form and updates state-backed section data", () => {
    render(<TestMainContainer />);
    act(() => vi.runAllTimers());

    const pantryBefore = getLatestSectionProps("Pantry");

    // Locate the "Add Item" ToolSection and the default QuickAddForm by its accessible name
    const addItemSection = screen
      .getByRole("heading", { name: "Add Item" })
      .closest("section");
    const addForm = within(addItemSection).getByRole("form", {
      name: "Quick add inventory item",
    });

    fireEvent.change(within(addForm).getByLabelText("Item Name:"), {
      target: { value: "Test Granola Bars" },
    });
    fireEvent.change(within(addForm).getByLabelText("Category:"), {
      target: { value: "Snacks" },
    });
    fireEvent.change(within(addForm).getByLabelText("Location:"), {
      target: { value: "Pantry" },
    });
    fireEvent.change(within(addForm).getByLabelText("Quantity on Hand:"), {
      target: { value: "3" },
    });

    fireEvent.click(within(addForm).getByRole("button", { name: "Add Item" }));

    const pantrySection = screen
      .getByRole("heading", { name: "Pantry" })
      .closest("section");
    const pantryAfter = getLatestSectionProps("Pantry");

    expect(pantrySection).toBeTruthy();
    expect(pantryAfter.items.length).toBe(pantryBefore.items.length + 1);
    expect(pantrySection?.textContent).toContain("Test Granola Bars");
  });

  it("submits add-to-shopping-list form and updates shopping-list state/render", () => {
    render(<TestMainContainer />);
    act(() => vi.runAllTimers());

    const pantryBefore = getLatestSectionProps("Pantry");
    const shoppingBefore = getLatestSectionProps("Shopping List");
    const pantryCandidate = pantryBefore.items[0];

    expect(pantryCandidate).toBeTruthy();

    fireEvent.change(screen.getByLabelText("mock-qty-Pantry"), {
      target: { value: "2" },
    });

    fireEvent.submit(screen.getByRole("form", { name: "mock-form-Pantry" }));

    const shoppingSection = screen
      .getByRole("heading", { name: "Shopping List" })
      .closest("section");
    const shoppingAfter = getLatestSectionProps("Shopping List");

    expect(shoppingSection).toBeTruthy();
    expect(shoppingAfter.items.length).toBe(shoppingBefore.items.length + 1);
    expect(shoppingSection?.textContent).toContain(pantryCandidate?.ItemName);
  });

  it("removes an item from shopping-list state/render path", () => {
    render(<TestMainContainer />);
    act(() => vi.runAllTimers());

    const shoppingBefore = getLatestSectionProps("Shopping List");
    const shoppingItemToRemove = shoppingBefore.items[0];

    expect(shoppingItemToRemove).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "mock-remove-Shopping List" }),
    );

    const shoppingSection = screen
      .getByRole("heading", { name: "Shopping List" })
      .closest("section");
    const shoppingAfter = getLatestSectionProps("Shopping List");

    expect(shoppingSection).toBeTruthy();
    expect(shoppingAfter.items.length).toBe(shoppingBefore.items.length - 1);
    expect(shoppingSection?.textContent).not.toContain(
      shoppingItemToRemove?.ItemName,
    );
  });

  it("resets TargetQty to QtyOnHand when removing from shopping list via stepper", () => {
    render(<TestMainContainer />);
    act(() => vi.runAllTimers());

    const shoppingBefore = getLatestSectionProps("Shopping List");
    const shoppingItemToRemove = shoppingBefore.items[0];

    expect(shoppingItemToRemove).toBeTruthy();

    const sectionTitle = shoppingItemToRemove.Location.includes("Fridge")
      ? "Fridge"
      : shoppingItemToRemove.Location.includes("Freezer")
        ? "Freezer"
        : "Pantry";

    fireEvent.click(
      screen.getByRole("button", { name: "mock-remove-Shopping List" }),
    );

    const locationSection = getLatestSectionProps(sectionTitle);
    const updatedItem = locationSection.items.find(
      (item) => item.id === shoppingItemToRemove.id,
    );

    expect(locationSection).toBeTruthy();
    expect(updatedItem).toBeTruthy();
    expect(updatedItem.TargetQty).toBe(shoppingItemToRemove.QtyOnHand);
    expect(updatedItem.NeedRestock).toBe(false);
  });
  it("toggles between QuickAddForm and AddInventoryItemForm", () => {
    render(<TestMainContainer />);
    act(() => vi.runAllTimers());

    // QuickAddForm should be visible by default
    expect(
      screen.getByRole("form", { name: "Quick add inventory item" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("form", { name: "Add Inventory Item" }),
    ).toBeNull();

    // Toggle button should offer to switch to Full Form
    const toggleBtn = screen.getByRole("button", {
      name: "Switch to Full Form",
    });
    expect(toggleBtn).toBeTruthy();

    // Click toggle to switch to Full Form
    fireEvent.click(toggleBtn);

    // AddInventoryItemForm should now be visible, QuickAddForm hidden
    expect(
      screen.getByRole("form", { name: "Add Inventory Item" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("form", { name: "Quick add inventory item" }),
    ).toBeNull();

    // Button text should update
    expect(
      screen.getByRole("button", { name: "Switch to Quick Add" }),
    ).toBeTruthy();

    // Click toggle to switch back
    fireEvent.click(
      screen.getByRole("button", { name: "Switch to Quick Add" }),
    );

    // QuickAddForm should be back
    expect(
      screen.getByRole("form", { name: "Quick add inventory item" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("form", { name: "Add Inventory Item" }),
    ).toBeNull();
  });

  // -- Loading / Error UI --------------------------------------------------

  it("loading spinner renders while isLoading is true", () => {
    render(<TestMainContainer />);

    // Before timers resolve, the loading indicator should be visible
    const loadingStatus = screen.getByRole("status");
    expect(loadingStatus).toBeTruthy();
    expect(loadingStatus.textContent).toContain("Loading");

    // Inventory sections should NOT be rendered yet
    expect(screen.queryByRole("heading", { name: "Fridge" })).toBeNull();

    // After loading completes, the spinner disappears
    act(() => vi.runAllTimers());
    expect(screen.queryByText("Loading")).toBeNull();
    expect(screen.getByRole("heading", { name: "Fridge" })).toBeTruthy();
  });

  it("error message and Retry button render when error is set", () => {
    // Make Math.random return 0 so loadSampleData triggers its failure branch
    import.meta.env.VITE_SIMULATE_ERRORS = "true";
    vi.spyOn(Math, "random").mockReturnValue(0);

    render(<TestMainContainer />);
    act(() => vi.runAllTimers());

    // Error alert should be visible with the failure message
    const alertEl = screen.getByRole("alert");
    expect(alertEl).toBeTruthy();
    expect(alertEl.textContent).toContain(
      "Failed to load sample data. Please try again.",
    );

    // Retry button should be present
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();

    // Inventory sections should NOT be rendered
    expect(screen.queryByRole("heading", { name: "Fridge" })).toBeNull();
  });

  it("renders a Load sample data action when an error exists and sample fallback is available", () => {
    const originalSampleData = import.meta.env.VITE_SAMPLE_DATA;
    const originalBaseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const originalTableName = import.meta.env.VITE_AIRTABLE_TABLE_NAME;

    import.meta.env.VITE_SAMPLE_DATA = "false";
    import.meta.env.VITE_AIRTABLE_BASE_ID = "test-base";
    import.meta.env.VITE_AIRTABLE_TABLE_NAME = "Pantry";

    try {
      renderWithMockedInventoryContext({
        dataValue: buildMockDataValue([], {
          error: "Server fetch failed",
          canLoadSampleDataFallback: true,
          filterAppliedItems: [],
          fridgeItems: [],
          freezerItems: [],
          pantryItems: [],
          shoppingListItems: [],
        }),
      });

      expect(screen.getByRole("alert").textContent).toContain(
        "Error: Server fetch failed",
      );
      expect(
        screen.getByRole("button", { name: "Load sample data" }),
      ).toBeTruthy();
    } finally {
      import.meta.env.VITE_SAMPLE_DATA = originalSampleData;
      import.meta.env.VITE_AIRTABLE_BASE_ID = originalBaseId;
      import.meta.env.VITE_AIRTABLE_TABLE_NAME = originalTableName;
    }
  });

  it("loads sample data after clicking Load sample data and clears the error", () => {
    const originalSampleData = import.meta.env.VITE_SAMPLE_DATA;
    const originalBaseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const originalTableName = import.meta.env.VITE_AIRTABLE_TABLE_NAME;

    import.meta.env.VITE_SAMPLE_DATA = "false";
    import.meta.env.VITE_AIRTABLE_BASE_ID = "test-base";
    import.meta.env.VITE_AIRTABLE_TABLE_NAME = "Pantry";
    vi.useFakeTimers();

    function StatefulErrorFallbackHarness() {
      const sampleItems = inventorySampleData.records.map((item) => ({
        ...item,
      }));
      const emptyData = buildMockDataValue([], {
        error: "Server fetch failed",
        canLoadSampleDataFallback: true,
        filterAppliedItems: [],
        fridgeItems: [],
        freezerItems: [],
        pantryItems: [],
        shoppingListItems: [],
      });
      const [dataValue, setDataValue] = useState(emptyData);

      const loadSampleDataFallback = () => {
        setDataValue((current) => ({
          ...current,
          error: null,
          isLoading: true,
        }));

        setTimeout(() => {
          setDataValue(
            buildMockDataValue(sampleItems, {
              error: null,
              isLoading: false,
              canLoadSampleDataFallback: true,
            }),
          );
        }, 500);
      };

      return (
        <InventoryDataContext.Provider value={dataValue}>
          <InventoryUIContext.Provider value={buildMockUIValue()}>
            <InventoryActionsContext.Provider
              value={buildMockActionsValue({ loadSampleDataFallback })}
            >
              <MainContainer />
            </InventoryActionsContext.Provider>
          </InventoryUIContext.Provider>
        </InventoryDataContext.Provider>
      );
    }

    try {
      render(<StatefulErrorFallbackHarness />);

      fireEvent.click(screen.getByRole("button", { name: "Load sample data" }));
      act(() => vi.advanceTimersByTime(500));

      expect(screen.queryByRole("alert")).toBeNull();
      expect(screen.getByRole("heading", { name: "Fridge" })).toBeTruthy();
      expect(screen.getByRole("heading", { name: "Pantry" })).toBeTruthy();
    } finally {
      vi.useRealTimers();
      import.meta.env.VITE_SAMPLE_DATA = originalSampleData;
      import.meta.env.VITE_AIRTABLE_BASE_ID = originalBaseId;
      import.meta.env.VITE_AIRTABLE_TABLE_NAME = originalTableName;
    }
  });

  it("Retry clears error and re-fetches", () => {
    // First render triggers a failure
    import.meta.env.VITE_SIMULATE_ERRORS = "true";
    vi.spyOn(Math, "random").mockReturnValue(0);

    render(<TestMainContainer />);
    act(() => vi.runAllTimers());

    // Error is shown
    expect(screen.getByRole("alert")).toBeTruthy();

    // Now make the next load succeed
    vi.mocked(Math.random).mockReturnValue(1);

    // Click Retry
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    // After retry triggers loadSampleData again, advance timers to resolve loading
    act(() => vi.runAllTimers());

    // Error should be cleared
    expect(screen.queryByRole("alert")).toBeNull();

    // Inventory sections should now render
    expect(screen.getByRole("heading", { name: "Fridge" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Pantry" })).toBeTruthy();
  });

  it("Refresh button reloads sample data", () => {
    render(<TestMainContainer />);
    act(() => vi.runAllTimers());

    const pantryBefore = getLatestSectionProps("Pantry");

    // Click Refresh
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    act(() => vi.runAllTimers());

    // Data should still be present (reloaded, not cleared)
    expect(screen.getByRole("heading", { name: "Fridge" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Pantry" })).toBeTruthy();
    expect(getLatestSectionProps("Pantry").items.length).toBe(
      pantryBefore.items.length,
    );
  });

  it("passes the archived section id when archived items are shown", () => {
    render(<TestMainContainer />);
    act(() => vi.runAllTimers());

    const showArchivedButton = screen.queryByRole("button", {
      name: /Show Archived Items/i,
    });

    if (!showArchivedButton) {
      expect(
        sectionRenderLog.some(
          (renderedSection) => renderedSection.title === "Archived Items",
        ),
      ).toBe(false);
      return;
    }

    fireEvent.click(showArchivedButton);

    const archivedSection = sectionRenderLog
      .filter((renderedSection) => renderedSection.title === "Archived Items")
      .pop();

    expect(archivedSection).toMatchObject({
      id: "archived",
      variant: "archived",
    });
  });

  // -- useMemo / useCallback behavior --------------------------------------

  describe("useMemo behavior", () => {
    it("section lists keep the same reference when unrelated state (showQuickAdd) changes", () => {
      render(<TestMainContainer />);
      act(() => vi.runAllTimers());

      const pantryBefore = sectionRenderLog
        .filter((r) => r.title === "Pantry")
        .pop();

      // Toggle showQuickAdd - an unrelated state change
      fireEvent.click(
        screen.getByRole("button", { name: "Switch to Full Form" }),
      );

      const pantryAfter = sectionRenderLog
        .filter((r) => r.title === "Pantry")
        .pop();

      // useMemo should return the cached array - same reference
      expect(pantryAfter.items).toBe(pantryBefore.items);
    });

    it("filtered list recomputes when search term changes", () => {
      render(<TestMainContainer />);
      act(() => vi.runAllTimers());

      const pantryBefore = sectionRenderLog
        .filter((r) => r.title === "Pantry")
        .pop();

      // Type a search term that matches only a subset of pantry items
      fireEvent.change(screen.getByLabelText("mock-search"), {
        target: { value: "Pearl" },
      });

      const pantryAfter = sectionRenderLog
        .filter((r) => r.title === "Pantry")
        .pop();

      // New reference - useMemo recomputed
      expect(pantryAfter.items).not.toBe(pantryBefore.items);
      expect(pantryAfter.items.length).toBeLessThan(pantryBefore.items.length);
    });

    it("sorted list recomputes when sort field or direction changes", () => {
      render(<TestMainContainer />);
      act(() => vi.runAllTimers());

      const fridgeBefore = sectionRenderLog
        .filter((r) => r.title === "Fridge")
        .pop();

      // Change sort to Category descending
      fireEvent.click(
        screen.getByRole("button", { name: "mock-sort-category-desc" }),
      );

      const fridgeAfter = sectionRenderLog
        .filter((r) => r.title === "Fridge")
        .pop();

      // New reference - useMemo recomputed due to sort dependency change
      expect(fridgeAfter.items).not.toBe(fridgeBefore.items);
    });

    it("section-specific lists recompute when inventoryItems changes", () => {
      render(<TestMainContainer />);
      act(() => vi.runAllTimers());

      const pantryBefore = sectionRenderLog
        .filter((r) => r.title === "Pantry")
        .pop();

      // Add a new Pantry item via QuickAddForm
      const addItemSection = screen
        .getByRole("heading", { name: "Add Item" })
        .closest("section");
      const addForm = within(addItemSection).getByRole("form", {
        name: "Quick add inventory item",
      });

      fireEvent.change(within(addForm).getByLabelText("Item Name:"), {
        target: { value: "Memo Test Item" },
      });
      fireEvent.change(within(addForm).getByLabelText("Category:"), {
        target: { value: "Snacks" },
      });
      fireEvent.change(within(addForm).getByLabelText("Location:"), {
        target: { value: "Pantry" },
      });
      fireEvent.change(within(addForm).getByLabelText("Quantity on Hand:"), {
        target: { value: "5" },
      });
      fireEvent.click(
        within(addForm).getByRole("button", { name: "Add Item" }),
      );

      const pantryAfter = sectionRenderLog
        .filter((r) => r.title === "Pantry")
        .pop();

      // New reference and one additional item
      expect(pantryAfter.items).not.toBe(pantryBefore.items);
      expect(pantryAfter.items.length).toBe(pantryBefore.items.length + 1);
    });

    it("QuickStatsBar values recompute when inventory changes", () => {
      render(<TestMainContainer />);
      act(() => vi.runAllTimers());

      const totalBefore = Number(screen.getByTestId("stats-total").textContent);
      const filteredBefore = Number(
        screen.getByTestId("stats-filtered").textContent,
      );

      // Add a new item
      const addItemSection = screen
        .getByRole("heading", { name: "Add Item" })
        .closest("section");
      const addForm = within(addItemSection).getByRole("form", {
        name: "Quick add inventory item",
      });

      fireEvent.change(within(addForm).getByLabelText("Item Name:"), {
        target: { value: "Stats Test Item" },
      });
      fireEvent.change(within(addForm).getByLabelText("Category:"), {
        target: { value: "Snacks" },
      });
      fireEvent.change(within(addForm).getByLabelText("Location:"), {
        target: { value: "Fridge" },
      });
      fireEvent.change(within(addForm).getByLabelText("Quantity on Hand:"), {
        target: { value: "1" },
      });
      fireEvent.click(
        within(addForm).getByRole("button", { name: "Add Item" }),
      );

      const totalAfter = Number(screen.getByTestId("stats-total").textContent);
      const filteredAfter = Number(
        screen.getByTestId("stats-filtered").textContent,
      );

      expect(totalAfter).toBe(totalBefore + 1);
      expect(filteredAfter).toBe(filteredBefore + 1);
    });
  });

  describe("useCallback behavior", () => {
    it("section props maintain same reference across renders when deps unchanged", () => {
      render(<TestMainContainer />);
      act(() => vi.runAllTimers());

      const pantryBefore = sectionRenderLog
        .filter((r) => r.title === "Pantry")
        .pop();

      // Toggle showQuickAdd - an unrelated state change that does not
      // affect any useCallback dependency array
      fireEvent.click(
        screen.getByRole("button", { name: "Switch to Full Form" }),
      );

      const pantryAfter = sectionRenderLog
        .filter((r) => r.title === "Pantry")
        .pop();

      // useMemo should return the cached array - same reference
      expect(pantryAfter.items).toBe(pantryBefore.items);
    });

    it("handler functions get new reference when deps change", () => {
      const renderLog = [];

      function TestParent() {
        const [count, setCount] = useState(0);
        const handler = useCallback(() => count, [count]);
        renderLog.push({ handler });
        return (
          <button onClick={() => setCount((c) => c + 1)}>increment</button>
        );
      }

      render(<TestParent />);
      fireEvent.click(screen.getByRole("button", { name: "increment" }));

      // After the state change, useCallback should produce a new reference
      expect(renderLog).toHaveLength(2);
      expect(renderLog[1].handler).not.toBe(renderLog[0].handler);
    });

    it("child components don't re-render when parent re-renders with stable callbacks", () => {
      const childRenderCount = { current: 0 };

      const MemoChild = memo(function MemoChild({ onClick }) {
        useEffect(() => {
          childRenderCount.current += 1;
        });
        return <button onClick={onClick}>child-action</button>;
      });

      function TestParent() {
        const [count, setCount] = useState(0);
        const stableHandler = useCallback(() => {}, []);
        return (
          <div>
            <span>{count}</span>
            <button onClick={() => setCount((c) => c + 1)}>
              parent-action
            </button>
            <MemoChild onClick={stableHandler} />
          </div>
        );
      }

      render(<TestParent />);
      expect(childRenderCount.current).toBe(1);

      // Trigger parent re-render with unrelated state change
      fireEvent.click(screen.getByRole("button", { name: "parent-action" }));

      // MemoChild should NOT have re-rendered because stableHandler
      // is the same reference thanks to useCallback
      expect(childRenderCount.current).toBe(1);
    });
  });

  // -- Re-fetch prevention --------------------------------------------------

  describe("Re-fetch prevention", () => {
    let savedSampleData;
    let savedServerFilter;

    beforeEach(() => {
      savedSampleData = import.meta.env.VITE_SAMPLE_DATA;
      savedServerFilter = import.meta.env.VITE_SERVER_FILTER;

      // Default API mock: populate data and finish loading synchronously
      vi.mocked(fetchInventoryItems).mockImplementation(
        ({ setInventoryItems, setIsLoading, setError, setLastFetchedAt }) => {
          setError(null);
          setInventoryItems(inventorySampleData.records.map((r) => ({ ...r })));
          setLastFetchedAt?.(new Date());
          setIsLoading(false);
          return Promise.resolve();
        },
      );
    });

    afterEach(() => {
      import.meta.env.VITE_SAMPLE_DATA = savedSampleData;
      import.meta.env.VITE_SERVER_FILTER = savedServerFilter;
      vi.mocked(fetchInventoryItems).mockReset();
    });

    it("does not re-fetch when sort/filter changes and server-side params are inactive", () => {
      import.meta.env.VITE_SAMPLE_DATA = "false";
      import.meta.env.VITE_SERVER_FILTER = "false";

      render(<TestMainContainer />);

      // Initial mount triggers one fetch
      expect(fetchInventoryItems).toHaveBeenCalledTimes(1);

      // Change sort - should NOT trigger a re-fetch because server-side
      // filtering is disabled
      fireEvent.click(
        screen.getByRole("button", { name: "mock-sort-category-desc" }),
      );

      expect(fetchInventoryItems).toHaveBeenCalledTimes(1);
    });

    it("re-fetches when server-side params change", () => {
      import.meta.env.VITE_SAMPLE_DATA = "false";
      import.meta.env.VITE_SERVER_FILTER = "true";

      render(<TestMainContainer />);

      // Initial mount fetch
      expect(fetchInventoryItems).toHaveBeenCalledTimes(1);

      // Change sort - should trigger a re-fetch with server-side filtering
      fireEvent.click(
        screen.getByRole("button", { name: "mock-sort-category-desc" }),
      );

      expect(fetchInventoryItems).toHaveBeenCalledTimes(2);
    });

    it("Refresh button triggers API call regardless of server-side filter setting", () => {
      import.meta.env.VITE_SAMPLE_DATA = "false";
      import.meta.env.VITE_SERVER_FILTER = "false";

      render(<TestMainContainer />);

      expect(fetchInventoryItems).toHaveBeenCalledTimes(1);

      // Refresh always triggers a new fetch
      fireEvent.click(screen.getByRole("button", { name: "Refresh" }));

      expect(fetchInventoryItems).toHaveBeenCalledTimes(2);
    });

    it("aborts the previous in-flight fetch when a new fetch starts", () => {
      import.meta.env.VITE_SAMPLE_DATA = "false";
      import.meta.env.VITE_SERVER_FILTER = "true";

      const signals = [];
      vi.mocked(fetchInventoryItems).mockImplementation(
        ({
          setInventoryItems,
          setIsLoading,
          setError,
          setLastFetchedAt,
          signal,
        }) => {
          signals.push(signal);
          setError(null);
          setInventoryItems(inventorySampleData.records.map((r) => ({ ...r })));
          setLastFetchedAt?.(new Date());
          setIsLoading(false);
          return Promise.resolve();
        },
      );

      render(<TestMainContainer />);

      // Initial fetch registered
      expect(signals).toHaveLength(1);

      // Change sort to trigger a second fetch
      fireEvent.click(
        screen.getByRole("button", { name: "mock-sort-category-desc" }),
      );

      // doFetch aborts the previous controller before starting a new one
      expect(signals).toHaveLength(2);
      expect(signals[0].aborted).toBe(true);
      expect(signals[1].aborted).toBe(false);
    });
  });
});
