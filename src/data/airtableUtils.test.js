import { describe, it, expect } from "vitest";
import { buildAirtableParams } from "./airtableUtils";

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
