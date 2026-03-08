import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useShoppingList from "./useShoppingList";

vi.mock("../data/airtableUtils", () => ({
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

  // --- Derived state ---

  it("derives shoppingListItems from items where NeedRestock && TargetQty > QtyOnHand", () => {
    const items = [
      makeItem({ id: "a", NeedRestock: true, TargetQty: 5, QtyOnHand: 2 }),
      makeItem({ id: "b", NeedRestock: false, TargetQty: 3, QtyOnHand: 3 }),
      makeItem({ id: "c", NeedRestock: true, TargetQty: 4, QtyOnHand: 4 }),
      makeItem({ id: "d", NeedRestock: true, TargetQty: 10, QtyOnHand: 3 }),
    ];

    const { result } = renderHook(() => useShoppingList({ items, dispatch }));

    expect(result.current.shoppingListItems).toHaveLength(2);
    expect(result.current.shoppingListItems.map((i) => i.id)).toEqual([
      "a",
      "d",
    ]);
  });

  it("exposes shoppingListCount matching filtered length", () => {
    const items = [
      makeItem({ id: "a", NeedRestock: true, TargetQty: 5, QtyOnHand: 2 }),
      makeItem({ id: "b", NeedRestock: false }),
    ];

    const { result } = renderHook(() => useShoppingList({ items, dispatch }));

    expect(result.current.shoppingListCount).toBe(1);
  });

  it("returns empty list when no items need restock", () => {
    const items = [
      makeItem({ id: "a", NeedRestock: false }),
      makeItem({ id: "b", NeedRestock: true, TargetQty: 3, QtyOnHand: 3 }),
    ];

    const { result } = renderHook(() => useShoppingList({ items, dispatch }));

    expect(result.current.shoppingListItems).toHaveLength(0);
    expect(result.current.shoppingListCount).toBe(0);
  });

  it("updates derived state when items prop changes", () => {
    const initialItems = [makeItem({ id: "a", NeedRestock: false })];
    const { result, rerender } = renderHook(
      ({ items }) => useShoppingList({ items, dispatch }),
      { initialProps: { items: initialItems } },
    );

    expect(result.current.shoppingListCount).toBe(0);

    const updatedItems = [
      makeItem({ id: "a", NeedRestock: true, TargetQty: 5, QtyOnHand: 2 }),
    ];
    rerender({ items: updatedItems });

    expect(result.current.shoppingListCount).toBe(1);
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
      payload: { id: "item-1", targetQty: 5 },
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
      payload: "item-1",
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
      payload: { id: "item-1", targetQty: 8 },
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
});
