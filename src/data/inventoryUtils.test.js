import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isExpiringSoon,
  isLowStock,
  getActiveFilterCount,
  countExpiringSoon,
  sortItems,
  formatRelativeTime,
  isDataStale,
  arraysEqual,
  fetchParamsEqual,
  LOW_STOCK_THRESHOLD,
  STALE_TIME_MS,
} from "./inventoryUtils";

// ---------------------------------------------------------------------------
// isExpiringSoon
// ---------------------------------------------------------------------------
describe("isExpiringSoon", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns false when ExpiresOn is null/undefined", () => {
    expect(isExpiringSoon({ ExpiresOn: null })).toBe(false);
    expect(isExpiringSoon({ ExpiresOn: undefined })).toBe(false);
    expect(isExpiringSoon({})).toBe(false);
  });

  it("returns false for an invalid date string", () => {
    expect(isExpiringSoon({ ExpiresOn: "not-a-date" })).toBe(false);
  });

  it("returns true for an item expiring today", () => {
    vi.setSystemTime(new Date("2026-03-08T12:00:00Z"));
    expect(isExpiringSoon({ ExpiresOn: "2026-03-08" })).toBe(true);
  });

  it("returns true for an item expiring within 14 days", () => {
    vi.setSystemTime(new Date("2026-03-08T00:00:00Z"));
    expect(isExpiringSoon({ ExpiresOn: "2026-03-20" })).toBe(true);
  });

  it("returns true at the 14-day boundary", () => {
    vi.setSystemTime(new Date("2026-03-08T00:00:00Z"));
    expect(isExpiringSoon({ ExpiresOn: "2026-03-22" })).toBe(true);
  });

  it("returns false for an item expiring beyond 14 days", () => {
    vi.setSystemTime(new Date("2026-03-08T00:00:00Z"));
    expect(isExpiringSoon({ ExpiresOn: "2026-03-23" })).toBe(false);
  });

  it("returns false for an already-expired item", () => {
    vi.setSystemTime(new Date("2026-03-08T00:00:00Z"));
    expect(isExpiringSoon({ ExpiresOn: "2026-03-07" })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isLowStock
// ---------------------------------------------------------------------------
describe("isLowStock", () => {
  it("returns true when QtyOnHand is below threshold", () => {
    expect(isLowStock({ QtyOnHand: LOW_STOCK_THRESHOLD - 1 })).toBe(true);
  });

  it("returns false when QtyOnHand equals threshold", () => {
    expect(isLowStock({ QtyOnHand: LOW_STOCK_THRESHOLD })).toBe(false);
  });

  it("returns false when QtyOnHand exceeds threshold", () => {
    expect(isLowStock({ QtyOnHand: LOW_STOCK_THRESHOLD + 10 })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getActiveFilterCount
// ---------------------------------------------------------------------------
describe("getActiveFilterCount", () => {
  it("returns 0 for empty filters", () => {
    expect(
      getActiveFilterCount({
        categories: [],
        expiringSoon: false,
        lowStock: false,
      }),
    ).toBe(0);
  });

  it("counts each active filter separately", () => {
    expect(
      getActiveFilterCount({
        categories: ["Dairy"],
        expiringSoon: true,
        lowStock: true,
      }),
    ).toBe(3);
  });

  it("counts categories as one filter regardless of length", () => {
    expect(
      getActiveFilterCount({
        categories: ["Dairy", "Frozen", "Meat"],
        expiringSoon: false,
        lowStock: false,
      }),
    ).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// countExpiringSoon
// ---------------------------------------------------------------------------
describe("countExpiringSoon", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("counts items expiring within threshold", () => {
    vi.setSystemTime(new Date("2026-03-08T00:00:00Z"));
    const items = [
      { ExpiresOn: "2026-03-10" },
      { ExpiresOn: "2026-04-10" },
      { ExpiresOn: null },
    ];
    expect(countExpiringSoon(items)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// sortItems
// ---------------------------------------------------------------------------
describe("sortItems", () => {
  const items = [
    { ItemName: "Banana", QtyOnHand: 3, ExpiresOn: "2026-04-01" },
    { ItemName: "Apple", QtyOnHand: 10, ExpiresOn: "2026-03-15" },
    { ItemName: "Cherry", QtyOnHand: 1, ExpiresOn: null },
  ];

  it("returns items unchanged when sortField is falsy", () => {
    expect(sortItems(items, "", "asc")).toEqual(items);
    expect(sortItems(items, null, "asc")).toEqual(items);
  });

  it("sorts strings alphabetically ascending", () => {
    const sorted = sortItems(items, "ItemName", "asc");
    expect(sorted.map((i) => i.ItemName)).toEqual([
      "Apple",
      "Banana",
      "Cherry",
    ]);
  });

  it("sorts strings alphabetically descending", () => {
    const sorted = sortItems(items, "ItemName", "desc");
    expect(sorted.map((i) => i.ItemName)).toEqual([
      "Cherry",
      "Banana",
      "Apple",
    ]);
  });

  it("sorts numbers ascending", () => {
    const sorted = sortItems(items, "QtyOnHand", "asc");
    expect(sorted.map((i) => i.QtyOnHand)).toEqual([1, 3, 10]);
  });

  it("sorts numbers descending", () => {
    const sorted = sortItems(items, "QtyOnHand", "desc");
    expect(sorted.map((i) => i.QtyOnHand)).toEqual([10, 3, 1]);
  });

  it("sorts dates ascending with nulls last", () => {
    const sorted = sortItems(items, "ExpiresOn", "asc");
    expect(sorted.map((i) => i.ExpiresOn)).toEqual([
      "2026-03-15",
      "2026-04-01",
      null,
    ]);
  });

  it("sorts dates descending with nulls last", () => {
    const sorted = sortItems(items, "ExpiresOn", "desc");
    expect(sorted.map((i) => i.ExpiresOn)).toEqual([
      "2026-04-01",
      "2026-03-15",
      null,
    ]);
  });

  it("does not mutate the original array", () => {
    const original = [...items];
    sortItems(items, "ItemName", "asc");
    expect(items).toEqual(original);
  });
});

// ---------------------------------------------------------------------------
// formatRelativeTime
// ---------------------------------------------------------------------------
describe("formatRelativeTime", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns null for null or undefined", () => {
    expect(formatRelativeTime(null)).toBeNull();
    expect(formatRelativeTime(undefined)).toBeNull();
  });

  it('returns "Just now" for less than 60 seconds ago', () => {
    const now = Date.now();
    vi.setSystemTime(now);
    expect(formatRelativeTime(now - 30 * 1000)).toBe("Just now");
  });

  it("returns minutes for less than an hour ago", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    expect(formatRelativeTime(now - 5 * 60 * 1000)).toBe("5 minutes ago");
  });

  it('uses singular "minute" for 1 minute', () => {
    const now = Date.now();
    vi.setSystemTime(now);
    expect(formatRelativeTime(now - 60 * 1000)).toBe("1 minute ago");
  });

  it("returns hours for less than a day ago", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    expect(formatRelativeTime(now - 3 * 60 * 60 * 1000)).toBe("3 hours ago");
  });

  it('uses singular "hour" for 1 hour', () => {
    const now = Date.now();
    vi.setSystemTime(now);
    expect(formatRelativeTime(now - 60 * 60 * 1000)).toBe("1 hour ago");
  });

  it("returns days for 24+ hours ago", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    expect(formatRelativeTime(now - 2 * 24 * 60 * 60 * 1000)).toBe(
      "2 days ago",
    );
  });

  it('uses singular "day" for 1 day', () => {
    const now = Date.now();
    vi.setSystemTime(now);
    expect(formatRelativeTime(now - 24 * 60 * 60 * 1000)).toBe("1 day ago");
  });
});

// ---------------------------------------------------------------------------
// isDataStale
// ---------------------------------------------------------------------------
describe("isDataStale", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns false when lastFetchedAt is null", () => {
    expect(isDataStale(null)).toBe(false);
  });

  it("returns false when data was just fetched", () => {
    vi.setSystemTime(new Date("2026-03-08T12:00:00Z"));
    expect(isDataStale(new Date("2026-03-08T12:00:00Z"))).toBe(false);
  });

  it("returns true when data is older than STALE_TIME_MS", () => {
    const now = new Date("2026-03-08T12:10:00Z");
    vi.setSystemTime(now);
    const old = new Date(now.getTime() - STALE_TIME_MS - 1);
    expect(isDataStale(old)).toBe(true);
  });

  it("returns true at exactly the threshold", () => {
    const now = new Date("2026-03-08T12:05:00Z");
    vi.setSystemTime(now);
    const exact = new Date(now.getTime() - STALE_TIME_MS);
    expect(isDataStale(exact)).toBe(true);
  });

  it("accepts a custom threshold", () => {
    const now = new Date("2026-03-08T12:00:30Z");
    vi.setSystemTime(now);
    const recent = new Date("2026-03-08T12:00:00Z");
    expect(isDataStale(recent, 10 * 1000)).toBe(true);
    expect(isDataStale(recent, 60 * 1000)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// arraysEqual
// ---------------------------------------------------------------------------
describe("arraysEqual", () => {
  it("returns true for identical arrays", () => {
    expect(arraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  it("returns true for two empty arrays", () => {
    expect(arraysEqual([], [])).toBe(true);
  });

  it("returns false for different lengths", () => {
    expect(arraysEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  it("returns false for same length but different elements", () => {
    expect(arraysEqual([1, 2, 3], [1, 2, 4])).toBe(false);
  });

  it("uses strict equality", () => {
    expect(arraysEqual(["1"], [1])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// fetchParamsEqual
// ---------------------------------------------------------------------------
describe("fetchParamsEqual", () => {
  const baseParams = {
    sortField: "ItemName",
    sortDirection: "asc",
    searchTerm: "",
    filters: { categories: [], expiringSoon: false, lowStock: false },
  };

  it("returns true for the same reference", () => {
    expect(fetchParamsEqual(baseParams, baseParams)).toBe(true);
  });

  it("returns true for structurally equal objects", () => {
    expect(fetchParamsEqual({ ...baseParams }, { ...baseParams })).toBe(true);
  });

  it("returns false when sortField differs", () => {
    expect(
      fetchParamsEqual(baseParams, { ...baseParams, sortField: "Category" }),
    ).toBe(false);
  });

  it("returns false when sortDirection differs", () => {
    expect(
      fetchParamsEqual(baseParams, { ...baseParams, sortDirection: "desc" }),
    ).toBe(false);
  });

  it("returns false when searchTerm differs", () => {
    expect(
      fetchParamsEqual(baseParams, { ...baseParams, searchTerm: "milk" }),
    ).toBe(false);
  });

  it("returns false when filter flags differ", () => {
    expect(
      fetchParamsEqual(baseParams, {
        ...baseParams,
        filters: { ...baseParams.filters, expiringSoon: true },
      }),
    ).toBe(false);
  });

  it("returns false when categories differ", () => {
    expect(
      fetchParamsEqual(baseParams, {
        ...baseParams,
        filters: { ...baseParams.filters, categories: ["Dairy"] },
      }),
    ).toBe(false);
  });

  it("returns false when one param is null", () => {
    expect(fetchParamsEqual(baseParams, null)).toBe(false);
    expect(fetchParamsEqual(null, baseParams)).toBe(false);
  });
});
