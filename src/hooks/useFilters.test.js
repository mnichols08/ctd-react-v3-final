import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useFilters from "./useFilters";

function setup() {
  const dispatch = vi.fn();
  return { dispatch, ...renderHook(() => useFilters({ dispatch })) };
}

describe("useFilters", () => {
  it("setSearch dispatches setSearch action", () => {
    const { result, dispatch } = setup();

    act(() => result.current.setSearch("olive oil"));

    expect(dispatch).toHaveBeenCalledWith({
      type: "setSearch",
      payload: "olive oil",
    });
  });

  it("setSort dispatches setSort action", () => {
    const { result, dispatch } = setup();

    act(() => result.current.setSort("QtyOnHand", "desc"));

    expect(dispatch).toHaveBeenCalledWith({
      type: "setSort",
      payload: { field: "QtyOnHand", direction: "desc" },
    });
  });

  it("setFilters dispatches setFilters action", () => {
    const { result, dispatch } = setup();
    const newFilters = {
      categories: ["Dairy"],
      expiringSoon: true,
      lowStock: false,
      status: "active",
    };

    act(() => result.current.setFilters(newFilters));

    expect(dispatch).toHaveBeenCalledWith({
      type: "setFilters",
      payload: newFilters,
    });
  });

  it("clearFilters dispatches clearFilters action", () => {
    const { result, dispatch } = setup();

    act(() => result.current.clearFilters());

    expect(dispatch).toHaveBeenCalledWith({ type: "clearFilters" });
  });
});
