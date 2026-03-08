import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useFilters from "./useFilters";

describe("useFilters", () => {
  it("returns default state", () => {
    const { result } = renderHook(() => useFilters());

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

  it("setSearch updates searchTerm", () => {
    const { result } = renderHook(() => useFilters());

    act(() => result.current.setSearch("olive oil"));

    expect(result.current.searchTerm).toBe("olive oil");
  });

  it("setSort updates sortConfig", () => {
    const { result } = renderHook(() => useFilters());

    act(() => result.current.setSort("QtyOnHand", "desc"));

    expect(result.current.sortConfig).toEqual({
      field: "QtyOnHand",
      direction: "desc",
    });
  });

  it("setFilters updates filters object", () => {
    const { result } = renderHook(() => useFilters());
    const newFilters = {
      categories: ["Dairy"],
      expiringSoon: true,
      lowStock: false,
      needRestock: false,
      status: "active",
    };

    act(() => result.current.setFilters(newFilters));

    expect(result.current.filters).toEqual(newFilters);
  });

  it("clearFilters resets filters and searchTerm to defaults", () => {
    const { result } = renderHook(() => useFilters());

    // Set some values first
    act(() => {
      result.current.setSearch("test");
      result.current.setFilters({
        categories: ["Snacks"],
        expiringSoon: true,
        lowStock: true,
        needRestock: true,
        status: "archived",
      });
    });

    act(() => result.current.clearFilters());

    expect(result.current.searchTerm).toBe("");
    expect(result.current.filters).toEqual({
      categories: [],
      expiringSoon: false,
      lowStock: false,
      needRestock: false,
      status: "",
    });
  });

  it("clearFilters preserves sortConfig", () => {
    const { result } = renderHook(() => useFilters());

    act(() => result.current.setSort("Brand", "desc"));
    act(() => result.current.clearFilters());

    expect(result.current.sortConfig).toEqual({
      field: "Brand",
      direction: "desc",
    });
  });
});
