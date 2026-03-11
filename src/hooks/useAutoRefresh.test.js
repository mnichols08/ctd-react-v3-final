import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useAutoRefresh from "./useAutoRefresh";
import { STALE_CHECK_INTERVAL_MS } from "../data/inventoryUtils";

// Helpers ----------------------------------------------------------------
const freshTimestamp = () => new Date(); // not stale
const staleTimestamp = () => new Date(Date.now() - 6 * 60 * 1000); // 6 min ago → stale

const defaultProps = () => ({
  sortConfig: { field: "ItemName", direction: "asc" },
  filters: { Category: "", Status: "" },
  searchTerm: "",
  refetch: vi.fn(),
  lastFetchedAt: freshTimestamp(),
  isLoading: false,
});

// Simulate visibility change events
function fireVisibilityChange(state) {
  Object.defineProperty(document, "visibilityState", {
    value: state,
    writable: true,
    configurable: true,
  });
  document.dispatchEvent(new Event("visibilitychange"));
}

// -----------------------------------------------------------------------
describe("useAutoRefresh", () => {
  beforeEach(() => {
    // default to non-sample, no server filter
    import.meta.env.VITE_SAMPLE_DATA = "false";
    import.meta.env.VITE_SERVER_FILTER = "false";
    import.meta.env.VITE_AIRTABLE_BASE_ID = "test-base";
    import.meta.env.VITE_AIRTABLE_TABLE_NAME = "Pantry";
  });

  afterEach(() => {
    delete import.meta.env.VITE_SERVER_FILTER;
    delete import.meta.env.VITE_AIRTABLE_BASE_ID;
    delete import.meta.env.VITE_AIRTABLE_TABLE_NAME;
  });

  // --- Server-filter re-fetch effect -----------------------------------
  describe("server-filter re-fetch", () => {
    it("re-fetches when sort/filter/search params change with server filter on", () => {
      import.meta.env.VITE_SERVER_FILTER = "true";

      const props = defaultProps();
      const { rerender } = renderHook((p) => useAutoRefresh(p), {
        initialProps: props,
      });

      // Initial render — should not trigger refetch (params match ref)
      expect(props.refetch).not.toHaveBeenCalled();

      // Change sortConfig → should trigger refetch
      const updated = {
        ...props,
        sortConfig: { field: "Category", direction: "desc" },
      };
      rerender(updated);

      expect(props.refetch).toHaveBeenCalledTimes(1);
      expect(props.refetch).toHaveBeenCalledWith({
        sortConfig: updated.sortConfig,
        filterConfig: updated.filters,
        searchTerm: updated.searchTerm,
      });
    });

    it("skips re-fetch when params haven't actually changed", () => {
      import.meta.env.VITE_SERVER_FILTER = "true";

      const props = defaultProps();
      const { rerender } = renderHook((p) => useAutoRefresh(p), {
        initialProps: props,
      });

      // Re-render with same props
      rerender({ ...props });
      expect(props.refetch).not.toHaveBeenCalled();
    });

    it("does nothing when VITE_SERVER_FILTER is not 'true'", () => {
      import.meta.env.VITE_SERVER_FILTER = "false";

      const props = defaultProps();
      const { rerender } = renderHook((p) => useAutoRefresh(p), {
        initialProps: props,
      });

      rerender({
        ...props,
        sortConfig: { field: "Category", direction: "desc" },
      });

      expect(props.refetch).not.toHaveBeenCalled();
    });

    it("does nothing in sample data mode", () => {
      import.meta.env.VITE_SAMPLE_DATA = "true";
      import.meta.env.VITE_SERVER_FILTER = "true";

      const props = defaultProps();
      const { rerender } = renderHook((p) => useAutoRefresh(p), {
        initialProps: props,
      });

      rerender({
        ...props,
        sortConfig: { field: "Category", direction: "desc" },
      });

      expect(props.refetch).not.toHaveBeenCalled();
    });
  });

  // --- Visibility-change effect ----------------------------------------
  describe("visibility-change auto-refresh", () => {
    it("refetches when tab becomes visible and data is stale", () => {
      const props = {
        ...defaultProps(),
        lastFetchedAt: staleTimestamp(),
      };

      renderHook((p) => useAutoRefresh(p), { initialProps: props });

      act(() => fireVisibilityChange("visible"));

      expect(props.refetch).toHaveBeenCalledWith({ silent: true });
    });

    it("does not refetch when data is fresh", () => {
      const props = {
        ...defaultProps(),
        lastFetchedAt: freshTimestamp(),
      };

      renderHook((p) => useAutoRefresh(p), { initialProps: props });

      act(() => fireVisibilityChange("visible"));

      expect(props.refetch).not.toHaveBeenCalled();
    });

    it("does not refetch while already loading", () => {
      const props = {
        ...defaultProps(),
        lastFetchedAt: staleTimestamp(),
        isLoading: true,
      };

      renderHook((p) => useAutoRefresh(p), { initialProps: props });

      act(() => fireVisibilityChange("visible"));

      expect(props.refetch).not.toHaveBeenCalled();
    });

    it("does not refetch in sample data mode", () => {
      import.meta.env.VITE_SAMPLE_DATA = "true";

      const props = {
        ...defaultProps(),
        lastFetchedAt: staleTimestamp(),
      };

      renderHook((p) => useAutoRefresh(p), { initialProps: props });

      act(() => fireVisibilityChange("visible"));

      expect(props.refetch).not.toHaveBeenCalled();
    });

    it("removes the event listener on unmount", () => {
      const removeSpy = vi.spyOn(document, "removeEventListener");

      const props = {
        ...defaultProps(),
        lastFetchedAt: staleTimestamp(),
      };

      const { unmount } = renderHook((p) => useAutoRefresh(p), {
        initialProps: props,
      });

      unmount();

      expect(removeSpy).toHaveBeenCalledWith(
        "visibilitychange",
        expect.any(Function),
      );
      removeSpy.mockRestore();
    });
  });

  // --- Periodic stale-check interval -----------------------------------
  describe("periodic stale-check", () => {
    it("calls refetch when interval fires and data is stale + visible", () => {
      // Start with visible tab
      Object.defineProperty(document, "visibilityState", {
        value: "visible",
        writable: true,
        configurable: true,
      });

      const props = {
        ...defaultProps(),
        lastFetchedAt: staleTimestamp(),
      };

      renderHook((p) => useAutoRefresh(p), { initialProps: props });

      // Advance past one interval tick
      act(() => vi.advanceTimersByTime(STALE_CHECK_INTERVAL_MS));

      expect(props.refetch).toHaveBeenCalledWith({ silent: true });
    });

    it("does not call refetch when tab is hidden", () => {
      Object.defineProperty(document, "visibilityState", {
        value: "hidden",
        writable: true,
        configurable: true,
      });

      const props = {
        ...defaultProps(),
        lastFetchedAt: staleTimestamp(),
      };

      renderHook((p) => useAutoRefresh(p), { initialProps: props });

      act(() => vi.advanceTimersByTime(STALE_CHECK_INTERVAL_MS));

      expect(props.refetch).not.toHaveBeenCalled();
    });

    it("clears the interval on unmount", () => {
      const clearSpy = vi.spyOn(globalThis, "clearInterval");

      const props = defaultProps();
      const { unmount } = renderHook((p) => useAutoRefresh(p), {
        initialProps: props,
      });

      unmount();

      expect(clearSpy).toHaveBeenCalled();
      clearSpy.mockRestore();
    });

    it("does nothing in sample data mode", () => {
      import.meta.env.VITE_SAMPLE_DATA = "true";

      Object.defineProperty(document, "visibilityState", {
        value: "visible",
        writable: true,
        configurable: true,
      });

      const props = {
        ...defaultProps(),
        lastFetchedAt: staleTimestamp(),
      };

      renderHook((p) => useAutoRefresh(p), { initialProps: props });

      act(() => vi.advanceTimersByTime(STALE_CHECK_INTERVAL_MS));

      expect(props.refetch).not.toHaveBeenCalled();
    });
  });

  // --- Overlapping trigger deduplication --------------------------------
  describe("overlapping trigger deduplication", () => {
    it("fires refetch only once when visibility and interval trigger simultaneously", () => {
      Object.defineProperty(document, "visibilityState", {
        value: "visible",
        writable: true,
        configurable: true,
      });

      const props = {
        ...defaultProps(),
        lastFetchedAt: staleTimestamp(),
      };

      renderHook((p) => useAutoRefresh(p), { initialProps: props });

      // Fire visibility trigger first
      act(() => fireVisibilityChange("visible"));
      expect(props.refetch).toHaveBeenCalledTimes(1);

      // Interval fires within the dedup window — should be suppressed
      act(() => vi.advanceTimersByTime(1_000));

      // Still only one call
      expect(props.refetch).toHaveBeenCalledTimes(1);
      expect(props.refetch).toHaveBeenCalledTimes(1);
      expect(props.refetch).toHaveBeenCalledWith({ silent: true });
    });

    it("allows a new refetch after the dedup window expires", () => {
      Object.defineProperty(document, "visibilityState", {
        value: "visible",
        writable: true,
        configurable: true,
      });

      const props = {
        ...defaultProps(),
        lastFetchedAt: staleTimestamp(),
      };

      renderHook((p) => useAutoRefresh(p), {
        initialProps: props,
      });

      // First trigger
      act(() => fireVisibilityChange("visible"));
      expect(props.refetch).toHaveBeenCalledTimes(1);

      // Advance past the 5-second dedup window
      act(() => vi.advanceTimersByTime(5_000));

      // Second trigger should now be allowed
      act(() => vi.advanceTimersByTime(STALE_CHECK_INTERVAL_MS - 5_000));
      expect(props.refetch).toHaveBeenCalledTimes(2);
    });

    it("still allows refresh after a failed silent fetch (lastFetchedAt unchanged)", () => {
      Object.defineProperty(document, "visibilityState", {
        value: "visible",
        writable: true,
        configurable: true,
      });

      const props = {
        ...defaultProps(),
        lastFetchedAt: staleTimestamp(),
      };

      const { rerender } = renderHook((p) => useAutoRefresh(p), {
        initialProps: props,
      });

      // First trigger (simulates a silent refresh that will fail)
      act(() => fireVisibilityChange("visible"));
      expect(props.refetch).toHaveBeenCalledTimes(1);

      // Simulate failed fetch: lastFetchedAt stays the same, re-render with same props
      rerender({ ...props });

      // Advance past the dedup window
      act(() => vi.advanceTimersByTime(STALE_CHECK_INTERVAL_MS));

      // Should be able to refetch again despite lastFetchedAt never changing
      expect(props.refetch).toHaveBeenCalledTimes(2);
    });
  });
});
