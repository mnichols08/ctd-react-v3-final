import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useShoppingList from "./useShoppingList";
import { patchInventoryItem } from "../data/airtableUtils";

vi.mock("../data/airtableUtils", () => ({
  isLocalStorageFallbackMode: vi.fn(() => false),
  isSampleDataMode: vi.fn(() => import.meta.env.VITE_SAMPLE_DATA === "true"),
  patchInventoryItem: vi.fn(),
}));

const makeItem = (overrides = {}) => ({
  id: "item-1",
  ItemName: "Olive Oil",
  QtyOnHand: 2,
  TargetQty: 2,
  NeedRestock: false,
  ...overrides,
});

describe("useShoppingList", () => {
  let dispatch;

  beforeEach(() => {
    dispatch = vi.fn();
    vi.clearAllMocks();
  });

  // --- addToShoppingList ---

  it("addToShoppingList dispatches addToShoppingList action", async () => {
    const items = [makeItem({ id: "item-1", QtyOnHand: 2 })];
    const { result } = renderHook(() => useShoppingList({ items, dispatch }));

    await act(async () => {
      await result.current.addToShoppingList("item-1", 3);
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: "addToShoppingList",
      payload: expect.objectContaining({ id: "item-1", targetQty: 5 }),
    });
  });

  it("addToShoppingList does nothing for unknown item id", async () => {
    const items = [makeItem({ id: "item-1" })];
    const { result } = renderHook(() => useShoppingList({ items, dispatch }));

    await act(async () => {
      await result.current.addToShoppingList("nonexistent", 1);
    });

    expect(dispatch).not.toHaveBeenCalled();
  });

  it("addToShoppingList does nothing for non-finite qty", async () => {
    const items = [makeItem({ id: "item-1" })];
    const { result } = renderHook(() => useShoppingList({ items, dispatch }));

    await act(async () => {
      await result.current.addToShoppingList("item-1", "abc");
    });

    expect(dispatch).not.toHaveBeenCalled();
  });

  // --- removeFromShoppingList ---

  it("removeFromShoppingList dispatches removeFromShoppingList action", async () => {
    const items = [
      makeItem({
        id: "item-1",
        NeedRestock: true,
        TargetQty: 5,
        QtyOnHand: 2,
      }),
    ];
    const { result } = renderHook(() => useShoppingList({ items, dispatch }));

    await act(async () => {
      await result.current.removeFromShoppingList("item-1");
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: "removeFromShoppingList",
      payload: expect.objectContaining({ id: "item-1" }),
    });
  });

  it("removeFromShoppingList does nothing for unknown item id", async () => {
    const items = [makeItem({ id: "item-1" })];
    const { result } = renderHook(() => useShoppingList({ items, dispatch }));

    await act(async () => {
      await result.current.removeFromShoppingList("nonexistent");
    });

    expect(dispatch).not.toHaveBeenCalled();
  });

  // --- updateTargetQty ---

  it("updateTargetQty dispatches updateTargetQty action", async () => {
    const items = [
      makeItem({
        id: "item-1",
        NeedRestock: true,
        TargetQty: 5,
        QtyOnHand: 2,
      }),
    ];
    const { result } = renderHook(() => useShoppingList({ items, dispatch }));

    await act(async () => {
      await result.current.updateTargetQty("item-1", 8);
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: "updateTargetQty",
      payload: expect.objectContaining({ id: "item-1", targetQty: 8 }),
    });
  });

  it("updateTargetQty does nothing for unknown item id", async () => {
    const items = [makeItem({ id: "item-1" })];
    const { result } = renderHook(() => useShoppingList({ items, dispatch }));

    await act(async () => {
      await result.current.updateTargetQty("nonexistent", 5);
    });

    expect(dispatch).not.toHaveBeenCalled();
  });

  it("updateTargetQty does nothing for non-finite qty", async () => {
    const items = [makeItem({ id: "item-1" })];
    const { result } = renderHook(() => useShoppingList({ items, dispatch }));

    await act(async () => {
      await result.current.updateTargetQty("item-1", NaN);
    });

    expect(dispatch).not.toHaveBeenCalled();
  });

  // --- persistUpdate (VITE_SAMPLE_DATA=false) ---

  describe("persistUpdate (API mode)", () => {
    let original;

    beforeEach(() => {
      original = import.meta.env.VITE_SAMPLE_DATA;
      import.meta.env.VITE_SAMPLE_DATA = "false";
    });

    afterEach(() => {
      import.meta.env.VITE_SAMPLE_DATA = original;
    });

    it("dispatches updateItem with server response on successful patch", async () => {
      const serverItem = {
        id: "item-1",
        ItemName: "Olive Oil",
        QtyOnHand: 2,
        NeedRestock: true,
        TargetQty: 5,
        LastUpdated: "2026-03-08T10:00:00.000Z",
      };
      patchInventoryItem.mockResolvedValue(serverItem);

      const items = [makeItem({ id: "item-1", QtyOnHand: 2 })];
      const { result } = renderHook(() => useShoppingList({ items, dispatch }));

      await act(async () => {
        await result.current.addToShoppingList("item-1", 3);
      });

      // The optimistic dispatch + success dispatch
      expect(patchInventoryItem).toHaveBeenCalledWith("item-1", {
        NeedRestock: true,
        TargetQty: 5,
      });

      const updateCalls = dispatch.mock.calls.filter(
        ([action]) => action.type === "updateItem",
      );
      expect(updateCalls).toHaveLength(1);
      expect(updateCalls[0][0]).toEqual({
        type: "updateItem",
        payload: { id: "item-1", fields: serverItem },
      });
    });

    it("rolls back with previousItem and sets error on failed patch", async () => {
      patchInventoryItem.mockRejectedValue(new Error("Network failure"));

      const items = [
        makeItem({
          id: "item-1",
          QtyOnHand: 2,
          NeedRestock: true,
          TargetQty: 5,
        }),
      ];
      const { result } = renderHook(() => useShoppingList({ items, dispatch }));

      await act(async () => {
        await result.current.removeFromShoppingList("item-1");
      });

      expect(patchInventoryItem).toHaveBeenCalledWith("item-1", {
        NeedRestock: false,
        TargetQty: 2,
      });

      // Should dispatch rollback updateItem with the original item
      const updateCalls = dispatch.mock.calls.filter(
        ([action]) => action.type === "updateItem",
      );
      expect(updateCalls).toHaveLength(1);
      expect(updateCalls[0][0].payload.fields).toMatchObject({
        id: "item-1",
        NeedRestock: true,
        TargetQty: 5,
      });

      // Should dispatch setSaveError (first null to clear, then the error)
      const errorCalls = dispatch.mock.calls.filter(
        ([action]) => action.type === "setSaveError",
      );
      expect(errorCalls).toHaveLength(2);
      expect(errorCalls[0][0].payload).toBeNull();
      expect(errorCalls[1][0].payload).toBe("Network failure");
    });
  });
});
