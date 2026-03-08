import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useFilters from "./useFilters";

const defaultState = {
  searchTerm: "",
  sortConfig: { field: "ItemName", direction: "asc" },
  filters: {
    categories: [],
    expiringSoon: false,
    lowStock: false,
    needRestock: false,
    status: "",
  },
};

function setup(overrides = {}) {
  const dispatch = vi.fn();
  const props = { ...defaultState, ...overrides, dispatch };
  return { dispatch, ...renderHook(() => useFilters(props)) };
}

describe("useFilters", () => {
  it("returns default state", () => {
    const { result } = setup();

    expect(result.current.searchTerm).toBe("");
    expect(result.current.sortConfig).toEqual({
      field: "ItemName",
      direction: "asc",
    });
    expect(result.current.filters).toEqual({
      categories: [],
      expiringSoon: false,
      lowStock: false,
      needRestock: false,
      status: "",
    });
  });

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
      needRestock: false,
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
