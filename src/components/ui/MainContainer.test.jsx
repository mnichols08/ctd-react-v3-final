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

vi.mock("./QuickStatsBar.component", () => ({
  default: ({ inventoryItems, filteredItems }) => (
    <div data-testid="quick-stats">
      QuickStatsBar
      <span data-testid="stats-total">{inventoryItems?.length ?? 0}</span>
      <span data-testid="stats-filtered">{filteredItems?.length ?? 0}</span>
    </div>
  ),
}));

vi.mock("../forms/FilterBarForm.component", () => ({
  default: ({ handleRefresh, onSearch, onSort }) => (
    <div>
      FilterBarForm
      <button type="button" onClick={handleRefresh}>
        Refresh
      </button>
      <input
        aria-label="mock-search"
        onChange={(e) => onSearch(e.target.value)}
      />
      <button
        type="button"
        aria-label="mock-sort-category-desc"
        onClick={() => onSort("Category", "desc")}
      >
        Sort
      </button>
    </div>
  ),
}));

vi.mock("../sections/InventorySection.component", () => ({
  default: (props) => {
    sectionRenderLog.push(props);
    const { title, items, addToShoppingList, updateTargetQty } = props;
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
        {addToShoppingList && items[0] && (
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
        {updateTargetQty && items[0] && (
          <button
            onClick={() => updateTargetQty?.(items[0].id, items[0].QtyOnHand)}
          >
            {`mock-remove-${title}`}
          </button>
        )}
      </section>
    );
  },
}));

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

describe("MainContainer", () => {
  it("initializes state from sample data and passes filtered section items", () => {
    const expectedFridgeCount = inventorySampleData.records.filter(
      (item) => item.Location.includes("Fridge") && item.Status !== "archived",
    ).length;
    const expectedFreezerCount = inventorySampleData.records.filter(
      (item) => item.Location.includes("Freezer") && item.Status !== "archived",
    ).length;
    const expectedPantryCount = inventorySampleData.records.filter(
      (item) => item.Location.includes("Pantry") && item.Status !== "archived",
    ).length;
    const expectedShoppingListCount = inventorySampleData.records.filter(
      (item) => item.NeedRestock && item.TargetQty > item.QtyOnHand,
    ).length;

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

    expect(fridgeSection?.textContent).toContain(
      `count:${expectedFridgeCount}`,
    );
    expect(freezerSection?.textContent).toContain(
      `count:${expectedFreezerCount}`,
    );
    expect(pantrySection?.textContent).toContain(
      `count:${expectedPantryCount}`,
    );
    expect(shoppingSection?.textContent).toContain(
      `count:${expectedShoppingListCount}`,
    );
  });

  it("submits an add-item form and updates state-backed section data", () => {
    const initialPantryCount = inventorySampleData.records.filter(
      (item) => item.Location.includes("Pantry") && item.Status !== "archived",
    ).length;

    render(<TestMainContainer />);
    act(() => vi.runAllTimers());

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

    expect(pantrySection).toBeTruthy();
    expect(pantrySection?.textContent).toContain(
      `count:${initialPantryCount + 1}`,
    );
    expect(pantrySection?.textContent).toContain("Test Granola Bars");
  });

  it("submits add-to-shopping-list form and updates shopping-list state/render", () => {
    const initialShoppingListCount = inventorySampleData.records.filter(
      (item) => item.NeedRestock && item.TargetQty > item.QtyOnHand,
    ).length;

    const pantryCandidate = inventorySampleData.records.find(
      (item) => item.Location.includes("Pantry") && !item.NeedRestock,
    );

    expect(pantryCandidate).toBeTruthy();

    render(<TestMainContainer />);
    act(() => vi.runAllTimers());

    fireEvent.change(screen.getByLabelText("mock-qty-Pantry"), {
      target: { value: "2" },
    });

    fireEvent.submit(screen.getByRole("form", { name: "mock-form-Pantry" }));

    const shoppingSection = screen
      .getByRole("heading", { name: "Shopping List" })
      .closest("section");

    expect(shoppingSection).toBeTruthy();
    expect(shoppingSection?.textContent).toContain(
      `count:${initialShoppingListCount + 1}`,
    );
    expect(shoppingSection?.textContent).toContain(pantryCandidate?.ItemName);
  });

  it("removes an item from shopping-list state/render path", () => {
    const initialShoppingListItems = inventorySampleData.records.filter(
      (item) => item.NeedRestock && item.TargetQty > item.QtyOnHand,
    );
    const initialShoppingListCount = initialShoppingListItems.length;
    const shoppingItemToRemove = initialShoppingListItems[0];

    expect(shoppingItemToRemove).toBeTruthy();

    render(<TestMainContainer />);
    act(() => vi.runAllTimers());

    fireEvent.click(
      screen.getByRole("button", { name: "mock-remove-Shopping List" }),
    );

    const shoppingSection = screen
      .getByRole("heading", { name: "Shopping List" })
      .closest("section");

    expect(shoppingSection).toBeTruthy();
    expect(shoppingSection?.textContent).toContain(
      `count:${initialShoppingListCount - 1}`,
    );
    expect(shoppingSection?.textContent).not.toContain(
      shoppingItemToRemove?.ItemName,
    );
  });

  it("resets TargetQty to QtyOnHand when removing from shopping list via stepper", () => {
    const initialShoppingListItems = inventorySampleData.records.filter(
      (item) => item.NeedRestock && item.TargetQty > item.QtyOnHand,
    );
    const shoppingItemToRemove = initialShoppingListItems[0];

    expect(shoppingItemToRemove).toBeTruthy();

    const sectionTitle = shoppingItemToRemove.Location.includes("Fridge")
      ? "Fridge"
      : shoppingItemToRemove.Location.includes("Freezer")
        ? "Freezer"
        : "Pantry";

    render(<TestMainContainer />);
    act(() => vi.runAllTimers());

    fireEvent.click(
      screen.getByRole("button", { name: "mock-remove-Shopping List" }),
    );

    const locationSection = screen
      .getByRole("heading", { name: sectionTitle })
      .closest("section");

    expect(locationSection).toBeTruthy();
    expect(locationSection?.textContent).toContain(
      `${shoppingItemToRemove.ItemName}:${shoppingItemToRemove.QtyOnHand}:false`,
    );
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
    expect(loadingStatus.textContent).toContain("Loading...");

    // Inventory sections should NOT be rendered yet
    expect(screen.queryByRole("heading", { name: "Fridge" })).toBeNull();

    // After loading completes, the spinner disappears
    act(() => vi.runAllTimers());
    expect(screen.queryByText("Loading...")).toBeNull();
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

    // Inventory is loaded
    const initialPantryCount = inventorySampleData.records.filter(
      (item) => item.Location.includes("Pantry") && item.Status !== "archived",
    ).length;
    expect(
      screen.getByRole("heading", { name: "Pantry" }).closest("section")
        ?.textContent,
    ).toContain(`count:${initialPantryCount}`);

    // Click Refresh
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    act(() => vi.runAllTimers());

    // Data should still be present (reloaded, not cleared)
    expect(screen.getByRole("heading", { name: "Fridge" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Pantry" })).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Pantry" }).closest("section")
        ?.textContent,
    ).toContain(`count:${initialPantryCount}`);
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
    it("handler functions maintain same reference across renders when deps unchanged", () => {
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

      // useCallback should return the cached function - same reference
      expect(pantryAfter.addToShoppingList).toBe(
        pantryBefore.addToShoppingList,
      );
      expect(pantryAfter.removeFromShoppingList).toBe(
        pantryBefore.removeFromShoppingList,
      );
      expect(pantryAfter.updateItem).toBe(pantryBefore.updateItem);
      expect(pantryAfter.archiveItem).toBe(pantryBefore.archiveItem);
      expect(pantryAfter.deleteItem).toBe(pantryBefore.deleteItem);
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
