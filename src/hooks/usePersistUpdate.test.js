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

  // --- Race-condition / concurrency tests ---

  it("drops stale success response when a newer request is in flight", async () => {
    let resolveFirst;
    const slowResponse = new Promise((r) => {
      resolveFirst = r;
    });
    const fastResponse = { ItemName: "Second Edit", LastUpdated: "t2" };

    patchInventoryItem
      .mockReturnValueOnce(slowResponse)
      .mockResolvedValueOnce(fastResponse);

    const { result } = renderHook(() => usePersistUpdate(dispatch));

    // Launch first (slow) request
    let firstDone;
    await act(async () => {
      firstDone = result.current(
        "item-1",
        { ItemName: "First Edit" },
        { ItemName: "Original" },
      );
    });

    // Launch second (fast) request before first resolves
    await act(async () => {
      await result.current(
        "item-1",
        { ItemName: "Second Edit" },
        { ItemName: "First Edit" },
      );
    });

    // Second request's response should be dispatched
    expect(dispatch).toHaveBeenCalledWith({
      type: "updateItem",
      payload: { id: "item-1", fields: fastResponse },
    });

    dispatch.mockClear();

    // Now resolve the stale first request
    await act(async () => {
      resolveFirst({ ItemName: "First Edit", LastUpdated: "t1" });
      await firstDone;
    });

    // Stale response must NOT dispatch
    const updateCalls = dispatch.mock.calls.filter(
      ([a]) => a.type === "updateItem",
    );
    expect(updateCalls).toHaveLength(0);
  });

  it("skips rollback when a stale request fails but a newer one succeeded", async () => {
    let rejectFirst;
    const slowRequest = new Promise((_, rej) => {
      rejectFirst = rej;
    });
    const fastResponse = { ItemName: "Latest", LastUpdated: "t2" };

    patchInventoryItem
      .mockReturnValueOnce(slowRequest)
      .mockResolvedValueOnce(fastResponse);

    const { result } = renderHook(() => usePersistUpdate(dispatch));

    // Launch first (slow) request
    let firstDone;
    await act(async () => {
      firstDone = result.current(
        "item-1",
        { ItemName: "Attempt 1" },
        { ItemName: "Original" },
      );
    });

    // Launch second (fast) request
    await act(async () => {
      await result.current(
        "item-1",
        { ItemName: "Latest" },
        { ItemName: "Attempt 1" },
      );
    });

    dispatch.mockClear();

    // Now fail the stale first request
    await act(async () => {
      rejectFirst(new Error("Stale failure"));
      await firstDone;
    });

    // Must NOT rollback or set error — the newer request already succeeded
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("concurrent patches on different items are independent", async () => {
    const responseA = { ItemName: "A-updated" };
    const responseB = { ItemName: "B-updated" };

    let resolveA;
    patchInventoryItem
      .mockReturnValueOnce(
        new Promise((r) => {
          resolveA = r;
        }),
      )
      .mockResolvedValueOnce(responseB);

    const { result } = renderHook(() => usePersistUpdate(dispatch));

    // Launch request for item-A (slow)
    let doneA;
    await act(async () => {
      doneA = result.current(
        "item-A",
        { ItemName: "A-updated" },
        { ItemName: "A-old" },
      );
    });

    // Launch request for item-B (fast)
    await act(async () => {
      await result.current(
        "item-B",
        { ItemName: "B-updated" },
        { ItemName: "B-old" },
      );
    });

    // Item-B response should be applied
    expect(dispatch).toHaveBeenCalledWith({
      type: "updateItem",
      payload: { id: "item-B", fields: responseB },
    });

    // Now resolve item-A — should also be applied (no interference)
    await act(async () => {
      resolveA(responseA);
      await doneA;
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: "updateItem",
      payload: { id: "item-A", fields: responseA },
    });
  });
});
