import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  buildAirtableParams,
  fetchInventoryItems,
  createInventoryItem,
  patchInventoryItem,
  deleteInventoryItem,
  resetThrottle,
} from "./airtableUtils";

// --- Mock Airtable API responses matching { records: [{ id, fields }] } ---

/** GET /records – multi-record list response */
export const mockFetchResponse = {
  records: [
    {
      id: "rec123abc",
      fields: {
        ItemName: "Whole Milk",
        Brand: "Organic Valley",
        Category: "Dairy",
        QtyOnHand: 2,
        QtyUnit: "gallon",
        TargetQty: 3,
        NeedRestock: true,
        ExpiresOn: "2026-03-15",
        Location: "Fridge - Shelf 1",
        Status: null,
        Notes: "family favorite",
        Tags: "organic, staple",
      },
    },
    {
      id: "rec456def",
      fields: {
        ItemName: "Sesame Oil",
        Brand: "Dabur",
        Category: "Cooking Essentials",
        QtyOnHand: 0.1,
        QtyUnit: "bottle",
        TargetQty: 1,
        NeedRestock: true,
        ExpiresOn: "2026-10-01",
        Location: "Pantry - Shelf 5",
        Status: null,
        Notes: null,
        Tags: null,
      },
    },
    {
      id: "rec789ghi",
      fields: {
        ItemName: "Frozen Peas",
        Brand: "Green Giant",
        Category: "Frozen",
        QtyOnHand: 4,
        QtyUnit: "bag",
        TargetQty: 2,
        NeedRestock: false,
        ExpiresOn: "2027-01-20",
        Location: "Freezer - Drawer 2",
        Status: "archived",
        Notes: null,
        Tags: "vegetable",
      },
    },
  ],
};

/** POST /records – single-record creation response */
export const mockCreateResponse = {
  records: [
    {
      id: "recNewItem1",
      fields: {
        ItemName: "Cheddar Cheese",
        Brand: "Tillamook",
        Category: "Dairy",
        QtyOnHand: 1,
        QtyUnit: "block",
        TargetQty: 2,
        NeedRestock: true,
        ExpiresOn: "2026-04-10",
        Location: "Fridge - Shelf 2",
        Status: null,
        LastUpdated: "2026-03-06T12:00:00.000Z",
      },
    },
  ],
};

/** PATCH /records/:id – single-record update response */
export const mockPatchResponse = {
  id: "rec123abc",
  fields: {
    ItemName: "Whole Milk",
    Brand: "Organic Valley",
    Category: "Dairy",
    QtyOnHand: 5,
    QtyUnit: "gallon",
    TargetQty: 3,
    NeedRestock: false,
    ExpiresOn: "2026-03-15",
    Location: "Fridge - Shelf 1",
    Status: null,
    LastUpdated: "2026-03-06T14:30:00.000Z",
  },
};

/** DELETE /records/:id – deletion response */
export const mockDeleteResponse = {
  id: "rec123abc",
  deleted: true,
};

/** Error response matching Airtable's error format */
export const mockErrorResponse = {
  error: {
    type: "INVALID_REQUEST_UNKNOWN",
    message: "Could not find field 'BadField' in table",
  },
};

describe("buildAirtableParams", () => {
  // --- AC1: Sort parameters are sent when sort is active ---
  describe("sort parameters", () => {
    it("appends sort field and direction when sortConfig is provided", () => {
      const params = buildAirtableParams(
        { field: "ItemName", direction: "asc" },
        null,
        "",
      );
      expect(params.get("sort[0][field]")).toBe("ItemName");
      expect(params.get("sort[0][direction]")).toBe("asc");
    });

    it("defaults direction to asc when not desc", () => {
      const params = buildAirtableParams(
        { field: "Category", direction: "banana" },
        null,
        "",
      );
      expect(params.get("sort[0][direction]")).toBe("asc");
    });

    it("sends desc direction when specified", () => {
      const params = buildAirtableParams(
        { field: "QtyOnHand", direction: "desc" },
        null,
        "",
      );
      expect(params.get("sort[0][direction]")).toBe("desc");
    });

    it("omits sort params when sortConfig has no field", () => {
      const params = buildAirtableParams({}, null, "");
      expect(params.has("sort[0][field]")).toBe(false);
    });

    it("omits sort params when sortConfig is null", () => {
      const params = buildAirtableParams(null, null, "");
      expect(params.has("sort[0][field]")).toBe(false);
    });
  });

  // --- AC2: Filter formula is sent when filters are active ---
  describe("filterByFormula", () => {
    it("generates search formula across searchable fields", () => {
      const params = buildAirtableParams(null, null, "milk");
      const formula = params.get("filterByFormula");
      expect(formula).toContain('FIND(LOWER("milk"), LOWER({ItemName}))');
      expect(formula).toContain('FIND(LOWER("milk"), LOWER({Brand}))');
      expect(formula).toContain('FIND(LOWER("milk"), LOWER({Category}))');
      expect(formula).toContain('FIND(LOWER("milk"), LOWER({Tags}))');
      expect(formula).toContain('FIND(LOWER("milk"), LOWER({Notes}))');
      expect(formula).toMatch(/^OR\(/);
    });

    it("generates category filter for a single category", () => {
      const params = buildAirtableParams(null, { categories: ["Dairy"] }, "");
      const formula = params.get("filterByFormula");
      expect(formula).toBe('{Category}="Dairy"');
    });

    it("generates OR category filter for multiple categories", () => {
      const params = buildAirtableParams(
        null,
        { categories: ["Dairy", "Drinks"] },
        "",
      );
      const formula = params.get("filterByFormula");
      expect(formula).toBe('OR({Category}="Dairy", {Category}="Drinks")');
    });

    it("generates NeedRestock filter", () => {
      const params = buildAirtableParams(null, { needRestock: true }, "");
      expect(params.get("filterByFormula")).toBe("{NeedRestock}=TRUE()");
    });

    it("generates archived status filter", () => {
      const params = buildAirtableParams(null, { status: "archived" }, "");
      expect(params.get("filterByFormula")).toBe('{Status}="archived"');
    });

    it("generates active status filter", () => {
      const params = buildAirtableParams(null, { status: "active" }, "");
      expect(params.get("filterByFormula")).toBe(
        'OR({Status}=BLANK(), {Status}!="archived")',
      );
    });

    it("generates expiringSoon filter with correct day count", () => {
      const params = buildAirtableParams(null, { expiringSoon: true }, "");
      const formula = params.get("filterByFormula");
      expect(formula).toContain("{ExpiresOn} >= TODAY()");
      expect(formula).toContain("DATEADD(TODAY(), 14, 'days')");
    });

    it("generates lowStock filter using threshold constant", () => {
      const params = buildAirtableParams(null, { lowStock: true }, "");
      expect(params.get("filterByFormula")).toBe("{QtyOnHand} < 5");
    });

    it("omits filterByFormula when no filters or search are active", () => {
      const params = buildAirtableParams(null, null, "");
      expect(params.has("filterByFormula")).toBe(false);
    });

    it("omits filterByFormula when filters are all defaults", () => {
      const params = buildAirtableParams(
        null,
        { categories: [], expiringSoon: false, lowStock: false },
        "",
      );
      expect(params.has("filterByFormula")).toBe(false);
    });
  });

  // --- AC2 continued: Multiple filters combine with AND ---
  describe("combined filters", () => {
    it("wraps multiple filter clauses in AND()", () => {
      const params = buildAirtableParams(
        null,
        { categories: ["Dairy"], lowStock: true },
        "",
      );
      const formula = params.get("filterByFormula");
      expect(formula).toMatch(/^AND\(/);
      expect(formula).toContain('{Category}="Dairy"');
      expect(formula).toContain("{QtyOnHand} < 5");
    });

    it("combines search with category filter", () => {
      const params = buildAirtableParams(
        null,
        { categories: ["Fresh"] },
        "apple",
      );
      const formula = params.get("filterByFormula");
      expect(formula).toMatch(/^AND\(/);
      expect(formula).toContain("FIND(LOWER");
      expect(formula).toContain('{Category}="Fresh"');
    });

    it("combines sort and filter params together", () => {
      const params = buildAirtableParams(
        { field: "ItemName", direction: "asc" },
        { categories: ["Dairy"] },
        "milk",
      );
      expect(params.get("sort[0][field]")).toBe("ItemName");
      expect(params.get("filterByFormula")).toContain('{Category}="Dairy"');
      expect(params.get("filterByFormula")).toContain("FIND(LOWER");
    });
  });

  // --- AC5: Network requests show query parameters in the URL ---
  describe("URL encoding", () => {
    it("returns URLSearchParams that can be appended to a URL", () => {
      const params = buildAirtableParams(
        { field: "ItemName", direction: "asc" },
        { categories: ["Dairy"] },
        "milk",
      );
      const urlString = params.toString();
      // URLSearchParams encodes brackets and special chars
      expect(urlString).toContain("sort%5B0%5D%5Bfield%5D=ItemName");
      expect(urlString).toContain("filterByFormula=");
    });

    it("produces an empty string when no params are set", () => {
      const params = buildAirtableParams(null, null, "");
      expect(params.toString()).toBe("");
    });
  });

  // --- Security: escapes special characters in user input ---
  describe("input escaping", () => {
    it("escapes double quotes in search term", () => {
      const params = buildAirtableParams(null, null, 'say "hello"');
      const formula = params.get("filterByFormula");
      expect(formula).toContain('say \\"hello\\"');
      expect(formula).not.toContain('say "hello"');
    });

    it("escapes backslashes in category names", () => {
      const params = buildAirtableParams(
        null,
        { categories: ["back\\slash"] },
        "",
      );
      const formula = params.get("filterByFormula");
      expect(formula).toContain("back\\\\slash");
    });
  });
});

// ---------------------------------------------------------------------------
// Fetch mock helper — builds a vi.fn() that returns a Response-like object
// ---------------------------------------------------------------------------

/**
 * Create a mock fetch that resolves with the given body and status.
 *
 * @param {object} body   - JSON body to return from resp.json()
 * @param {object} [opts] - Optional overrides
 * @param {number} [opts.status=200]     - HTTP status code
 * @param {string} [opts.statusText="OK"] - HTTP status text
 * @param {boolean} [opts.ok]            - Defaults to status in 200–299
 * @param {boolean} [opts.networkError]  - If true, fetch rejects (simulates network failure)
 * @returns {import("vitest").Mock}
 */
function createMockFetch(body, opts = {}) {
  const {
    status = 200,
    statusText = "OK",
    ok = status >= 200 && status < 300,
    networkError = false,
  } = opts;

  if (networkError) {
    return vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
  }

  return vi.fn().mockResolvedValue({
    ok,
    status,
    statusText,
    json: vi.fn().mockResolvedValue(body),
  });
}

// ---------------------------------------------------------------------------
// API function tests (fetch, create, patch, delete)
// ---------------------------------------------------------------------------

describe("Airtable API functions", () => {
  let originalFetch;
  let consoleErrorSpy;
  beforeEach(() => {
    // The global test-setup enables fake timers for loading-simulation tests.
    // API tests need real timers so throttledFetch's Date.now / setTimeout work.
    vi.useRealTimers();
    originalFetch = globalThis.fetch;
    // Clear the module-level throttle queue so tests don't trigger real 1s sleeps.
    resetThrottle();
    // Silence expected console.error output from error-scenario tests
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
    consoleErrorSpy.mockRestore();
  });

  // -- fetchInventoryItems -------------------------------------------------

  describe("fetchInventoryItems", () => {
    it("successful fetch sets inventoryItems and isLoading: false", async () => {
      globalThis.fetch = createMockFetch(mockFetchResponse);

      const setInventoryItems = vi.fn();
      const setIsLoading = vi.fn();
      const setError = vi.fn();

      await fetchInventoryItems({
        setInventoryItems,
        setIsLoading,
        setError,
        sortConfig: null,
        filterConfig: null,
        searchTerm: "",
      });

      // starts loading, clears previous error
      expect(setIsLoading).toHaveBeenCalledWith(true);
      expect(setError).toHaveBeenCalledWith(null);

      // populates inventory with all records
      expect(setInventoryItems).toHaveBeenCalledTimes(1);
      const items = setInventoryItems.mock.calls[0][0];
      expect(items).toHaveLength(3);

      // ends loading
      expect(setIsLoading).toHaveBeenLastCalledWith(false);
    });

    it("failed fetch sets error message and isLoading: false", async () => {
      globalThis.fetch = createMockFetch(mockErrorResponse, {
        status: 500,
        statusText: "Internal Server Error",
      });

      const setInventoryItems = vi.fn();
      const setIsLoading = vi.fn();
      const setError = vi.fn();

      await fetchInventoryItems({
        setInventoryItems,
        setIsLoading,
        setError,
        sortConfig: null,
        filterConfig: null,
        searchTerm: "",
      });

      expect(setInventoryItems).not.toHaveBeenCalled();
      expect(setError).toHaveBeenCalledWith("500 Internal Server Error");
      expect(setIsLoading).toHaveBeenLastCalledWith(false);
    });

    it('401 error shows "Invalid API token" message', async () => {
      globalThis.fetch = createMockFetch(mockErrorResponse, {
        status: 401,
        statusText: "Unauthorized",
      });

      const setInventoryItems = vi.fn();
      const setIsLoading = vi.fn();
      const setError = vi.fn();

      await fetchInventoryItems({
        setInventoryItems,
        setIsLoading,
        setError,
        sortConfig: null,
        filterConfig: null,
        searchTerm: "",
      });

      expect(setInventoryItems).not.toHaveBeenCalled();
      expect(setError).toHaveBeenCalledWith(
        "Authentication failed: Invalid API token. Verify your VITE_AIRTABLE_PAT.",
      );
      expect(setIsLoading).toHaveBeenLastCalledWith(false);
    });

    it('network error shows "Network error" message', async () => {
      globalThis.fetch = createMockFetch(null, { networkError: true });

      const setInventoryItems = vi.fn();
      const setIsLoading = vi.fn();
      const setError = vi.fn();

      await fetchInventoryItems({
        setInventoryItems,
        setIsLoading,
        setError,
        sortConfig: null,
        filterConfig: null,
        searchTerm: "",
      });

      expect(setInventoryItems).not.toHaveBeenCalled();
      expect(setError).toHaveBeenCalledWith(
        "Network error: Unable to reach the server. Check your internet connection.",
      );
      expect(setIsLoading).toHaveBeenLastCalledWith(false);
    });

    it('404 error shows "Not found" message', async () => {
      globalThis.fetch = createMockFetch(mockErrorResponse, {
        status: 404,
        statusText: "Not Found",
      });

      const setError = vi.fn();

      await fetchInventoryItems({
        setInventoryItems: vi.fn(),
        setIsLoading: vi.fn(),
        setError,
        sortConfig: null,
        filterConfig: null,
        searchTerm: "",
      });

      expect(setError).toHaveBeenCalledWith(
        "Not found: Invalid base or table name. Verify VITE_AIRTABLE_BASE_ID and VITE_AIRTABLE_TABLE_NAME.",
      );
    });

    it('422 error shows "Bad request" message', async () => {
      globalThis.fetch = createMockFetch(mockErrorResponse, {
        status: 422,
        statusText: "Unprocessable Entity",
      });

      const setError = vi.fn();

      await fetchInventoryItems({
        setInventoryItems: vi.fn(),
        setIsLoading: vi.fn(),
        setError,
        sortConfig: null,
        filterConfig: null,
        searchTerm: "",
      });

      expect(setError).toHaveBeenCalledWith(
        "Bad request: The request was invalid. Check your query parameters and field names.",
      );
    });

    it('429 error shows "Rate limit exceeded" message', async () => {
      globalThis.fetch = createMockFetch(mockErrorResponse, {
        status: 429,
        statusText: "Too Many Requests",
      });

      const setError = vi.fn();

      await fetchInventoryItems({
        setInventoryItems: vi.fn(),
        setIsLoading: vi.fn(),
        setError,
        sortConfig: null,
        filterConfig: null,
        searchTerm: "",
      });

      expect(setError).toHaveBeenCalledWith(
        "Rate limit exceeded: Too many requests. Please wait 30 seconds and try again.",
      );
    });

    it("data maps correctly from Airtable shape to app shape", async () => {
      globalThis.fetch = createMockFetch(mockFetchResponse);

      const setInventoryItems = vi.fn();
      const setIsLoading = vi.fn();
      const setError = vi.fn();

      await fetchInventoryItems({
        setInventoryItems,
        setIsLoading,
        setError,
        sortConfig: null,
        filterConfig: null,
        searchTerm: "",
      });

      const items = setInventoryItems.mock.calls[0][0];

      // record.id is promoted to a top-level id property
      expect(items[0].id).toBe("rec123abc");

      // record.fields are spread as top-level properties
      expect(items[0].ItemName).toBe("Whole Milk");
      expect(items[0].Brand).toBe("Organic Valley");
      expect(items[0].Category).toBe("Dairy");
      expect(items[0].QtyOnHand).toBe(2);
      expect(items[0].NeedRestock).toBe(true);
      expect(items[0].ExpiresOn).toBe("2026-03-15");

      // second record also mapped correctly
      expect(items[1]).toMatchObject({
        id: "rec456def",
        ItemName: "Sesame Oil",
        QtyOnHand: 0.1,
      });

      // no nested "fields" key remains on the flattened items
      expect(items[0]).not.toHaveProperty("fields");
    });

    it("successful fetch calls setLastFetchedAt with a Date", async () => {
      globalThis.fetch = createMockFetch(mockFetchResponse);

      const setLastFetchedAt = vi.fn();

      await fetchInventoryItems({
        setInventoryItems: vi.fn(),
        setIsLoading: vi.fn(),
        setError: vi.fn(),
        sortConfig: null,
        filterConfig: null,
        searchTerm: "",
        setLastFetchedAt,
      });

      expect(setLastFetchedAt).toHaveBeenCalledTimes(1);
      expect(setLastFetchedAt.mock.calls[0][0]).toBeInstanceOf(Date);
    });

    it("failed fetch does not call setLastFetchedAt", async () => {
      globalThis.fetch = createMockFetch(mockErrorResponse, {
        status: 500,
        statusText: "Internal Server Error",
      });

      const setLastFetchedAt = vi.fn();

      await fetchInventoryItems({
        setInventoryItems: vi.fn(),
        setIsLoading: vi.fn(),
        setError: vi.fn(),
        sortConfig: null,
        filterConfig: null,
        searchTerm: "",
        setLastFetchedAt,
      });

      expect(setLastFetchedAt).not.toHaveBeenCalled();
    });
  });

  // -- createInventoryItem -------------------------------------------------

  describe("createInventoryItem", () => {
    it("successful create adds item to state with Airtable-generated ID", async () => {
      globalThis.fetch = createMockFetch(mockCreateResponse);

      const addInventoryItem = vi.fn();
      const setIsSaving = vi.fn();
      const setError = vi.fn();

      const result = await createInventoryItem({
        item: {
          id: "temp-local-id",
          ItemName: "Cheddar Cheese",
          Category: "Dairy",
        },
        addInventoryItem,
        setIsSaving,
        setError,
      });

      // returns true so the caller knows the form can be cleared
      expect(result).toBe(true);

      // addInventoryItem receives the Airtable-generated id, not the local temp id
      expect(addInventoryItem).toHaveBeenCalledTimes(1);
      const savedItem = addInventoryItem.mock.calls[0][0];
      expect(savedItem.id).toBe("recNewItem1");
      expect(savedItem.id).not.toBe("temp-local-id");
      expect(savedItem.ItemName).toBe("Cheddar Cheese");

      // saving lifecycle completes
      expect(setIsSaving).toHaveBeenCalledWith(true);
      expect(setIsSaving).toHaveBeenLastCalledWith(false);
      // Clears any previous error at the start; never sets an actual error
      expect(setError).toHaveBeenCalledWith(null);
      expect(setError).toHaveBeenCalledTimes(1);
    });

    it("failed create does not add item and shows error", async () => {
      globalThis.fetch = createMockFetch(mockErrorResponse, {
        status: 422,
        statusText: "Unprocessable Entity",
      });

      const addInventoryItem = vi.fn();
      const setIsSaving = vi.fn();
      const setError = vi.fn();

      const result = await createInventoryItem({
        item: { ItemName: "Bad Item" },
        addInventoryItem,
        setIsSaving,
        setError,
      });

      // returns false so the caller knows it failed
      expect(result).toBe(false);

      // item was NOT added to state
      expect(addInventoryItem).not.toHaveBeenCalled();

      // error message from JSON body is shown
      expect(setError).toHaveBeenCalledWith(
        "Could not find field 'BadField' in table",
      );

      // saving lifecycle still completes
      expect(setIsSaving).toHaveBeenLastCalledWith(false);
    });

    it("form doesn't clear on failure (returns false on network error)", async () => {
      globalThis.fetch = createMockFetch(null, { networkError: true });

      const addInventoryItem = vi.fn();
      const setIsSaving = vi.fn();
      const setError = vi.fn();

      const result = await createInventoryItem({
        item: { ItemName: "Test Item", Category: "Dairy" },
        addInventoryItem,
        setIsSaving,
        setError,
      });

      // returns false — the calling form checks this to decide whether to reset
      expect(result).toBe(false);

      // item was NOT added, so form state should be preserved by the caller
      expect(addInventoryItem).not.toHaveBeenCalled();

      // error is communicated to the user
      expect(setError).toHaveBeenCalledWith(
        "Network error: Unable to reach the server. Check your internet connection.",
      );

      // saving lifecycle still completes
      expect(setIsSaving).toHaveBeenLastCalledWith(false);
    });

    it('429 error shows "Rate limit exceeded" message', async () => {
      globalThis.fetch = createMockFetch(mockErrorResponse, {
        status: 429,
        statusText: "Too Many Requests",
      });

      const addInventoryItem = vi.fn();
      const setIsSaving = vi.fn();
      const setError = vi.fn();

      const result = await createInventoryItem({
        item: { ItemName: "Test Item" },
        addInventoryItem,
        setIsSaving,
        setError,
      });

      expect(result).toBe(false);
      expect(addInventoryItem).not.toHaveBeenCalled();
      expect(setError).toHaveBeenCalledWith(
        "Rate limit exceeded: Too many requests. Please wait 30 seconds and try again.",
      );
    });
  });

  // -- patchInventoryItem --------------------------------------------------

  describe("patchInventoryItem", () => {
    it("successful update modifies item in state", async () => {
      globalThis.fetch = createMockFetch(mockPatchResponse);

      const result = await patchInventoryItem("rec123abc", {
        QtyOnHand: 5,
        NeedRestock: false,
      });

      // returns the full updated record flattened for state
      expect(result).toMatchObject({
        id: "rec123abc",
        ItemName: "Whole Milk",
        QtyOnHand: 5,
        NeedRestock: false,
        LastUpdated: "2026-03-06T14:30:00.000Z",
      });
    });

    it("failed update reverts item to previous state (throws so caller can revert)", async () => {
      globalThis.fetch = createMockFetch(mockErrorResponse, {
        status: 422,
        statusText: "Unprocessable Entity",
      });

      // caller would optimistically update before calling patchInventoryItem,
      // then revert when it throws
      await expect(
        patchInventoryItem("rec123abc", { QtyOnHand: 5 }),
      ).rejects.toThrow("Could not find field 'BadField' in table");
    });

    it("only changed fields are included in PATCH body", async () => {
      globalThis.fetch = createMockFetch(mockPatchResponse);

      await patchInventoryItem("rec123abc", { QtyOnHand: 5 });

      // inspect the body sent to fetch
      const fetchCall = globalThis.fetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);

      // only QtyOnHand + auto-added LastUpdated — no other fields
      expect(body.fields).toHaveProperty("QtyOnHand", 5);
      expect(body.fields).toHaveProperty("LastUpdated");
      expect(Object.keys(body.fields)).toHaveLength(2);
    });

    it("throws on network failure", async () => {
      globalThis.fetch = createMockFetch(null, { networkError: true });

      await expect(
        patchInventoryItem("rec123abc", { QtyOnHand: 5 }),
      ).rejects.toThrow(
        "Network error: Unable to reach the server. Check your internet connection.",
      );
    });

    it('429 error shows "Rate limit exceeded" message', async () => {
      globalThis.fetch = createMockFetch(mockErrorResponse, {
        status: 429,
        statusText: "Too Many Requests",
      });

      await expect(
        patchInventoryItem("rec123abc", { QtyOnHand: 5 }),
      ).rejects.toThrow(
        "Rate limit exceeded: Too many requests. Please wait 30 seconds and try again.",
      );
    });
  });

  // -- deleteInventoryItem -------------------------------------------------

  describe("deleteInventoryItem", () => {
    it("successful delete removes item from state (returns confirmation)", async () => {
      globalThis.fetch = createMockFetch(mockDeleteResponse);

      const result = await deleteInventoryItem("rec123abc");

      // returns { id, deleted: true } so the caller can remove the item from state
      expect(result).toEqual({ id: "rec123abc", deleted: true });
    });

    it("failed delete keeps item and shows error (throws so caller preserves state)", async () => {
      globalThis.fetch = createMockFetch(mockErrorResponse, {
        status: 422,
        statusText: "Unprocessable Entity",
      });

      // the function throws, so the caller's catch block keeps the item in state
      await expect(deleteInventoryItem("rec123abc")).rejects.toThrow(
        "Could not find field 'BadField' in table",
      );
    });

    it("404 still removes from local state (already gone on server)", async () => {
      globalThis.fetch = createMockFetch(null, {
        status: 404,
        statusText: "Not Found",
      });

      const result = await deleteInventoryItem("rec123abc");

      // 404 is treated as success — record is already gone
      expect(result).toEqual({ id: "rec123abc", deleted: true });
    });

    it("throws on network failure", async () => {
      globalThis.fetch = createMockFetch(null, { networkError: true });

      await expect(deleteInventoryItem("rec123abc")).rejects.toThrow(
        "Network error: Unable to reach the server. Check your internet connection.",
      );
    });

    it('429 error shows "Rate limit exceeded" message', async () => {
      globalThis.fetch = createMockFetch(mockErrorResponse, {
        status: 429,
        statusText: "Too Many Requests",
      });

      await expect(deleteInventoryItem("rec123abc")).rejects.toThrow(
        "Rate limit exceeded: Too many requests. Please wait 30 seconds and try again.",
      );
    });
  });
});
