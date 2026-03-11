import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import usePersistUpdate from "./usePersistUpdate";
import { patchInventoryItem } from "../data/airtableUtils";

vi.mock("../data/airtableUtils", () => ({
  patchInventoryItem: vi.fn(),
}));

describe("usePersistUpdate", () => {
  let dispatch;

  beforeEach(() => {
    dispatch = vi.fn();
    vi.clearAllMocks();
    import.meta.env.VITE_SAMPLE_DATA = "false";
  });

  it("dispatches updateItem with server response on success", async () => {
    const serverFields = { ItemName: "Updated", LastUpdated: "2026-03-08" };
    patchInventoryItem.mockResolvedValue(serverFields);

    const { result } = renderHook(() => usePersistUpdate(dispatch));

    await act(async () => {
      await result.current(
        "item-1",
        { ItemName: "Updated" },
        { ItemName: "Old" },
      );
    });

    expect(patchInventoryItem).toHaveBeenCalledWith("item-1", {
      ItemName: "Updated",
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: "updateItem",
      payload: { id: "item-1", fields: serverFields },
    });
  });

  it("rolls back to previousItem and sets saveError on failure", async () => {
    patchInventoryItem.mockRejectedValue(new Error("Network error"));

    const previousItem = { ItemName: "Old", QtyOnHand: 5 };
    const { result } = renderHook(() => usePersistUpdate(dispatch));

    await act(async () => {
      await result.current("item-1", { ItemName: "New" }, previousItem);
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: "updateItem",
      payload: { id: "item-1", fields: previousItem },
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: "setSaveError",
      payload: "Network error",
    });
  });

  it("skips API call in sample data mode", async () => {
    import.meta.env.VITE_SAMPLE_DATA = "true";

    const { result } = renderHook(() => usePersistUpdate(dispatch));

    await act(async () => {
      await result.current("item-1", { ItemName: "New" }, { ItemName: "Old" });
    });

    expect(patchInventoryItem).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("returns a stable callback reference", () => {
    const { result, rerender } = renderHook(() => usePersistUpdate(dispatch));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
