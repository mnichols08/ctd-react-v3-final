import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useInventory from "./useInventory";
import { loadSampleData, fetchInventoryItems } from "../data/airtableUtils";
import {
  clearLocalInventoryItems,
  LOCAL_INVENTORY_STORAGE_KEY,
} from "../data/localInventoryStorage";

// Mock airtableUtils — sample-data mode is active in tests (VITE_SAMPLE_DATA=true)
// so most API functions won't be called, but loadSampleData will.
vi.mock("../data/airtableUtils", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    loadSampleData: vi.fn(actual.loadSampleData),
    fetchInventoryItems: vi.fn(actual.fetchInventoryItems),
    patchInventoryItem: vi.fn(),
    createInventoryItem: vi.fn(),
    deleteInventoryItem: vi.fn(),
  };
});

describe("useInventory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearLocalInventoryItems();
    import.meta.env.VITE_AIRTABLE_BASE_ID = "test-base";
    import.meta.env.VITE_AIRTABLE_TABLE_NAME = "Pantry";
  });

  afterEach(() => {
    clearLocalInventoryItems();
  });

  // Helper: render and wait for sample data to load
  async function renderAndLoad() {
    const { result } = renderHook(() => useInventory());

    // loadSampleData uses Math.random (mocked to 1 → no failure)
    // and setTimeout for simulated loading
    await act(() => vi.runAllTimers());

    return result;
  }

  it("starts in loading state with isLoading true", () => {
    const { result } = renderHook(() => useInventory());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("loads sample data and sets items", async () => {
    const result = await renderAndLoad();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items.length).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
  });

  it("addItem appends an item in sample-data mode", async () => {
    const result = await renderAndLoad();
    const initialCount = result.current.items.length;

    const newItem = {
      id: "test-new",
      ItemName: "Test Item",
      QtyOnHand: 5,
      TargetQty: 5,
    };

    await act(async () => {
      const success = await result.current.addItem(newItem);
      expect(success).toBe(true);
    });

    expect(result.current.items).toHaveLength(initialCount + 1);
    expect(result.current.items.find((i) => i.id === "test-new")).toBeTruthy();
  });

  it("deleteItem removes an item in sample-data mode", async () => {
    const result = await renderAndLoad();
    const firstItem = result.current.items[0];
    const initialCount = result.current.items.length;

    await act(async () => {
      await result.current.deleteItem(firstItem.id);
    });

    expect(result.current.items).toHaveLength(initialCount - 1);
    expect(result.current.items.find((i) => i.id === firstItem.id)).toBeFalsy();
  });

  it("updateItem optimistically updates fields", async () => {
    const result = await renderAndLoad();
    const firstItem = result.current.items[0];

    await act(async () => {
      await result.current.updateItem({ ...firstItem, ItemName: "Updated" });
    });

    const updated = result.current.items.find((i) => i.id === firstItem.id);
    expect(updated.ItemName).toBe("Updated");
  });

  it("archiveItem preserves shopping-list state while setting Status to archived", async () => {
    const result = await renderAndLoad();
    const item = result.current.items.find(
      (i) => i.Status !== "archived" && i.NeedRestock === true,
    );

    await act(async () => {
      await result.current.archiveItem(item.id);
    });

    const archived = result.current.items.find((i) => i.id === item.id);
    expect(archived.Status).toBe("archived");
    expect(archived.NeedRestock).toBe(true);
  });

  it("unarchiveItem restores visibility without clearing shopping-list state", async () => {
    const result = await renderAndLoad();
    // First archive an item
    const item = result.current.items.find(
      (i) => i.Status !== "archived" && i.NeedRestock === true,
    );
    await act(async () => {
      await result.current.archiveItem(item.id);
    });

    await act(async () => {
      await result.current.unarchiveItem(item.id);
    });

    const restored = result.current.items.find((i) => i.id === item.id);
    expect(restored.Status).toBeNull();
    expect(restored.NeedRestock).toBe(true);
  });

  it("exposes toggleQuickAdd, toggleShowArchived, and dismissSaveError functions", async () => {
    const result = await renderAndLoad();
    expect(typeof result.current.toggleQuickAdd).toBe("function");
    expect(typeof result.current.toggleShowArchived).toBe("function");
    expect(typeof result.current.dismissSaveError).toBe("function");
  });

  describe("loadSampleData error path", () => {
    it("sets error when Math.random triggers simulated failure", async () => {
      // Override the global mock so randomFailure = (0 < 0.33) → true
      import.meta.env.VITE_SIMULATE_ERRORS = "true";
      vi.spyOn(Math, "random").mockReturnValue(0);

      const { result } = renderHook(() => useInventory());
      await act(() => vi.runAllTimers());

      expect(result.current.error).toBe(
        "Failed to load sample data. Please try again.",
      );
      expect(result.current.isLoading).toBe(false);
      expect(result.current.items).toHaveLength(0);
    });

    it("recovers after refetch when failure clears", async () => {
      import.meta.env.VITE_SIMULATE_ERRORS = "true";
      vi.spyOn(Math, "random").mockReturnValue(0);

      const { result } = renderHook(() => useInventory());
      await act(() => vi.runAllTimers());
      expect(result.current.error).toBeTruthy();

      // Next call succeeds
      vi.mocked(Math.random).mockReturnValue(1);
      act(() => result.current.refetch());
      await act(() => vi.runAllTimers());

      expect(result.current.error).toBeNull();
      expect(result.current.items.length).toBeGreaterThan(0);
    });
  });

  describe("refetch", () => {
    it("calls loadSampleData again in sample-data mode", async () => {
      const result = await renderAndLoad();
      const callsBefore = loadSampleData.mock.calls.length;

      act(() => {
        result.current.refetch();
      });
      await act(() => vi.runAllTimers());

      expect(loadSampleData.mock.calls.length).toBe(callsBefore + 1);
    });

    it("cleans up the previous sample-data timer on refetch and unmount", () => {
      const firstCleanup = vi.fn();
      const secondCleanup = vi.fn();
      const thirdCleanup = vi.fn();

      vi.mocked(loadSampleData)
        .mockImplementationOnce(() => firstCleanup)
        .mockImplementationOnce(() => secondCleanup)
        .mockImplementationOnce(() => thirdCleanup);

      const { result, unmount } = renderHook(() => useInventory());

      act(() => {
        result.current.refetch();
      });
      expect(firstCleanup).toHaveBeenCalledTimes(1);
      expect(secondCleanup).not.toHaveBeenCalled();

      act(() => {
        result.current.refetch();
      });
      expect(secondCleanup).toHaveBeenCalledTimes(1);
      expect(thirdCleanup).not.toHaveBeenCalled();

      unmount();
      expect(thirdCleanup).toHaveBeenCalledTimes(1);
    });

    it("calls fetchInventoryItems with current state when VITE_SAMPLE_DATA is false", async () => {
      // Temporarily override VITE_SAMPLE_DATA
      const original = import.meta.env.VITE_SAMPLE_DATA;
      import.meta.env.VITE_SAMPLE_DATA = "false";

      fetchInventoryItems.mockImplementation(() => {});

      try {
        const { result } = renderHook(() => useInventory());
        // The initial fetch fires on mount
        await act(() => vi.runAllTimers());
        fetchInventoryItems.mockClear();

        act(() => {
          result.current.refetch();
        });

        expect(fetchInventoryItems).toHaveBeenCalledTimes(1);
        const callArgs = fetchInventoryItems.mock.calls[0][0];
        expect(callArgs).toMatchObject({
          sortConfig: { field: "ItemName", direction: "asc" },
          searchTerm: "",
        });
        expect(callArgs).toHaveProperty("filterConfig");
        expect(callArgs).toHaveProperty("signal");
      } finally {
        import.meta.env.VITE_SAMPLE_DATA = original;
      }
    });

    it("forwards explicit options to fetchInventoryItems", async () => {
      const original = import.meta.env.VITE_SAMPLE_DATA;
      import.meta.env.VITE_SAMPLE_DATA = "false";

      fetchInventoryItems.mockImplementation(() => {});

      try {
        const { result } = renderHook(() => useInventory());
        await act(() => vi.runAllTimers());
        fetchInventoryItems.mockClear();

        const customSort = { field: "Category", direction: "desc" };
        act(() => {
          result.current.refetch({
            sortConfig: customSort,
            searchTerm: "milk",
          });
        });

        const callArgs = fetchInventoryItems.mock.calls[0][0];
        expect(callArgs.sortConfig).toEqual(customSort);
        expect(callArgs.searchTerm).toBe("milk");
      } finally {
        import.meta.env.VITE_SAMPLE_DATA = original;
      }
    });
  });

  describe("environment fallback behavior", () => {
    let originalSampleData;
    let originalBaseId;
    let originalTableName;

    beforeEach(() => {
      originalSampleData = import.meta.env.VITE_SAMPLE_DATA;
      originalBaseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
      originalTableName = import.meta.env.VITE_AIRTABLE_TABLE_NAME;
    });

    afterEach(() => {
      import.meta.env.VITE_SAMPLE_DATA = originalSampleData;
      import.meta.env.VITE_AIRTABLE_BASE_ID = originalBaseId;
      import.meta.env.VITE_AIRTABLE_TABLE_NAME = originalTableName;
    });

    it("loads inventory from localStorage when Airtable env vars are missing", async () => {
      import.meta.env.VITE_SAMPLE_DATA = "false";
      import.meta.env.VITE_AIRTABLE_BASE_ID = "";
      import.meta.env.VITE_AIRTABLE_TABLE_NAME = "";

      const storedItems = [
        {
          id: "local-only-1",
          ItemName: "Local Granola",
          QtyOnHand: 2,
          QtyUnit: "box",
          TargetQty: 3,
          NeedRestock: true,
          Category: "Snacks",
          Location: "Pantry - Shelf 1",
          Status: null,
        },
      ];
      window.localStorage.setItem(
        LOCAL_INVENTORY_STORAGE_KEY,
        JSON.stringify(storedItems),
      );

      const { result } = renderHook(() => useInventory());
      await act(async () => {});

      expect(result.current.items).toEqual(storedItems);
      expect(loadSampleData).not.toHaveBeenCalled();
      expect(fetchInventoryItems).not.toHaveBeenCalled();
    });

    it("persists local changes back to localStorage when Airtable env vars are missing", async () => {
      import.meta.env.VITE_SAMPLE_DATA = "false";
      import.meta.env.VITE_AIRTABLE_BASE_ID = "";
      import.meta.env.VITE_AIRTABLE_TABLE_NAME = "";

      const { result } = renderHook(() => useInventory());
      await act(async () => {});

      await act(async () => {
        await result.current.addItem({
          id: "local-added-1",
          ItemName: "Local Pasta",
          QtyOnHand: 1,
          QtyUnit: "box",
          TargetQty: 1,
          NeedRestock: false,
          Category: "Dry",
          Location: "Pantry - Shelf 2",
          Status: null,
        });
      });

      const savedItems = JSON.parse(
        window.localStorage.getItem(LOCAL_INVENTORY_STORAGE_KEY),
      );
      expect(savedItems.some((item) => item.id === "local-added-1")).toBe(true);
    });

    it("surfaces fetch errors without auto-loading sample data when Airtable env vars are present", async () => {
      import.meta.env.VITE_SAMPLE_DATA = "false";
      import.meta.env.VITE_AIRTABLE_BASE_ID = "test-base";
      import.meta.env.VITE_AIRTABLE_TABLE_NAME = "Pantry";

      vi.mocked(fetchInventoryItems).mockImplementation(
        ({ setError, setIsLoading }) => {
          setError("Server fetch failed");
          setIsLoading(false);
          return Promise.resolve();
        },
      );

      const { result } = renderHook(() => useInventory());
      await act(async () => {});

      expect(result.current.error).toBe("Server fetch failed");
      expect(result.current.items).toEqual([]);
      expect(loadSampleData).not.toHaveBeenCalled();
    });
  });
});
