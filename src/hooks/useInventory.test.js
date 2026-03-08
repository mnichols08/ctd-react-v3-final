import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useInventory from "./useInventory";
import { loadSampleData, fetchInventoryItems } from "../data/airtableUtils";

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
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const result = await renderAndLoad();
    const firstItem = result.current.items[0];
    const initialCount = result.current.items.length;

    await act(async () => {
      await result.current.deleteItem(firstItem.id);
    });

    confirmSpy.mockRestore();

    expect(result.current.items).toHaveLength(initialCount - 1);
    expect(result.current.items.find((i) => i.id === firstItem.id)).toBeFalsy();
  });

  it("updateItem optimistically updates fields", async () => {
    const result = await renderAndLoad();
    const firstItem = result.current.items[0];

    await act(async () => {
      await result.current.updateItem(firstItem.id, { ItemName: "Updated" });
    });

    const updated = result.current.items.find((i) => i.id === firstItem.id);
    expect(updated.ItemName).toBe("Updated");
  });

  it("archiveItem sets Status to archived", async () => {
    const result = await renderAndLoad();
    const item = result.current.items.find((i) => i.Status !== "archived");

    await act(async () => {
      await result.current.archiveItem(item.id);
    });

    const archived = result.current.items.find((i) => i.id === item.id);
    expect(archived.Status).toBe("archived");
    expect(archived.NeedRestock).toBe(false);
  });

  it("unarchiveItem clears archived Status", async () => {
    const result = await renderAndLoad();
    // First archive an item
    const item = result.current.items.find((i) => i.Status !== "archived");
    await act(async () => {
      await result.current.archiveItem(item.id);
    });

    await act(async () => {
      await result.current.unarchiveItem(item.id);
    });

    const restored = result.current.items.find((i) => i.id === item.id);
    expect(restored.Status).toBeNull();
  });

  it("exposes dispatch function", async () => {
    const result = await renderAndLoad();
    expect(typeof result.current.dispatch).toBe("function");
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
});
