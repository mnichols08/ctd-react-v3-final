import sampleData from "./inventorySample.json";
import { EXPIRING_SOON_MS, LOW_STOCK_THRESHOLD } from "./inventoryUtils";
import { SEARCHABLE_FIELDS } from "./fieldConfig";

const BASE_URL = `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/${encodeURIComponent(import.meta.env.VITE_AIRTABLE_TABLE_NAME)}`;
const AUTH_TOKEN = `Bearer ${import.meta.env.VITE_AIRTABLE_PAT}`;
const EXPIRING_SOON_DAYS = EXPIRING_SOON_MS / (24 * 60 * 60 * 1000);

function escapeFormulaString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function buildAirtableParams(sortConfig, filterConfig, searchTerm) {
  const params = new URLSearchParams();

  // Sort params
  if (sortConfig?.field) {
    params.append("sort[0][field]", sortConfig.field);
    params.append(
      "sort[0][direction]",
      sortConfig.direction === "desc" ? "desc" : "asc",
    );
  }

  // Build filterByFormula
  const formulaParts = [];

  // Search term — case-insensitive substring match across multiple fields
  const term = searchTerm?.trim();
  if (term) {
    const escaped = escapeFormulaString(term);
    const clauses = SEARCHABLE_FIELDS.map(
      (f) => `FIND(LOWER("${escaped}"), LOWER({${f}}))`,
    );
    formulaParts.push(`OR(${clauses.join(", ")})`);
  }

  // Category filter
  if (filterConfig?.categories?.length > 0) {
    const catClauses = filterConfig.categories.map(
      (cat) => `{Category}="${escapeFormulaString(cat)}"`,
    );
    formulaParts.push(
      catClauses.length === 1 ? catClauses[0] : `OR(${catClauses.join(", ")})`,
    );
  }

  // Status filter — "archived" shows only archived, otherwise exclude archived
  if (filterConfig?.status === "archived") {
    formulaParts.push(`{Status}="archived"`);
  } else if (filterConfig?.status === "active") {
    formulaParts.push(`OR({Status}=BLANK(), {Status}!="archived")`);
  }

  // Expiring soon filter
  if (filterConfig?.expiringSoon) {
    formulaParts.push(
      `AND({ExpiresOn} != '', {ExpiresOn} >= TODAY(), {ExpiresOn} <= DATEADD(TODAY(), ${EXPIRING_SOON_DAYS}, 'days'))`,
    );
  }

  // Low stock filter
  if (filterConfig?.lowStock) {
    formulaParts.push(`{QtyOnHand} < ${LOW_STOCK_THRESHOLD}`);
  }

  if (formulaParts.length === 1) {
    params.append("filterByFormula", formulaParts[0]);
  } else if (formulaParts.length > 1) {
    params.append("filterByFormula", `AND(${formulaParts.join(", ")})`);
  }

  return params;
}

// --- Client-side rate limiter (Airtable allows 5 requests/sec) ---
const MAX_REQUESTS_PER_SECOND = 3; // Set to 3 to be safe and avoid hitting the limit
const requestTimestamps = [];

/** Clear the throttle queue — intended for test setup only. */
export const resetThrottle = () => {
  requestTimestamps.length = 0;
};

const throttledFetch = async (url, options) => {
  const now = Date.now();
  // Remove timestamps older than 1 second
  while (requestTimestamps.length && requestTimestamps[0] <= now - 1000) {
    requestTimestamps.shift();
  }
  // If we've hit the limit, wait until the oldest request falls outside the window
  if (requestTimestamps.length >= MAX_REQUESTS_PER_SECOND) {
    const waitTime = requestTimestamps[0] + 1000 - now;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
  requestTimestamps.push(Date.now());
  return fetch(url, options);
};

export const fetchInventoryItems = async ({
  setInventoryItems,
  setIsLoading,
  setError,
  sortConfig,
  filterConfig,
  searchTerm,
  setLastFetchedAt = () => {},
  signal,
}) => {
  setIsLoading(true);
  setError(null);
  // When server-side filtering is enabled, append sort/filter params to the URL
  const useServerFilter = import.meta.env.VITE_SERVER_FILTER === "true";
  const params = useServerFilter
    ? buildAirtableParams(sortConfig, filterConfig, searchTerm)
    : new URLSearchParams();
  const url = params.toString() ? `${BASE_URL}?${params.toString()}` : BASE_URL;

  const options = {
    method: "GET",
    headers: {
      Authorization: AUTH_TOKEN,
    },
    ...(signal && { signal }),
  };
  try {
    let resp;
    try {
      resp = await throttledFetch(url, options);
    } catch {
      throw new Error(
        "Network error: Unable to reach the server. Check your internet connection.",
      );
    }
    if (!resp.ok) {
      // On 422 with server-side params, fall back to fetching all records
      // and let client-side filtering handle it
      if (resp.status === 422 && useServerFilter && params.toString()) {
        console.warn(
          "Airtable returned 422 for query params — falling back to unfiltered fetch.",
        );
        let fallbackResp;
        try {
          fallbackResp = await throttledFetch(BASE_URL, options);
        } catch {
          throw new Error(
            "Network error: Unable to reach the server. Check your internet connection.",
          );
        }
        if (!fallbackResp.ok) {
          throw new Error(`${fallbackResp.status} ${fallbackResp.statusText}`);
        }
        resp = fallbackResp;
      } else {
        switch (resp.status) {
          case 401:
            throw new Error(
              "Authentication failed: Invalid API token. Verify your VITE_AIRTABLE_PAT.",
            );
          case 404:
            throw new Error(
              "Not found: Invalid base or table name. Verify VITE_AIRTABLE_BASE_ID and VITE_AIRTABLE_TABLE_NAME.",
            );
          case 422:
            throw new Error(
              "Bad request: The request was invalid. Check your query parameters and field names.",
            );
          case 429:
            throw new Error(
              "Rate limit exceeded: Too many requests. Please wait 30 seconds and try again.",
            );
          default:
            throw new Error(`${resp.status} ${resp.statusText}`);
        }
      }
    }
    const { records } = await resp.json();
    setInventoryItems(
      records.map((record) => {
        const item = {
          id: record.id,
          ...record.fields,
        };
        return item;
      }),
    );
    setLastFetchedAt(new Date());
  } catch (error) {
    if (signal?.aborted) return; // Request was intentionally cancelled
    console.error(error);
    setError(error.message);
  } finally {
    if (!signal?.aborted) {
      setIsLoading(false);
    }
  }
};

export const loadSampleData = ({
  setInventoryItems,
  setIsLoading,
  setError,
}) => {
  setIsLoading(true);
  setError(null);
  const simulateErrors = import.meta.env.VITE_SIMULATE_ERRORS === "true";
  if (simulateErrors && Math.random() < 0.33) {
    setError("Failed to load sample data. Please try again.");
    setIsLoading(false);
    return () => {};
  }
  const simulateLoad = setTimeout(() => {
    setInventoryItems(sampleData.records.map((item) => ({ ...item })));
    setIsLoading(false);
  }, 500);
  return () => {
    clearTimeout(simulateLoad);
  };
};

export const createInventoryItem = async ({
  item,
  addInventoryItem,
  setIsSaving,
  setError,
}) => {
  const { id: _id, ...fields } = item;
  const newFields = {
    ...fields,
    LastUpdated: new Date().toISOString(),
  };
  const payload = {
    records: [
      {
        fields: newFields,
      },
    ],
  };
  const options = {
    method: "POST",
    headers: {
      Authorization: AUTH_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };

  try {
    setError(null);
    setIsSaving(true);
    let resp;
    try {
      resp = await throttledFetch(BASE_URL, options);
    } catch {
      throw new Error(
        "Network error: Unable to reach the server. Check your internet connection.",
      );
    }
    if (!resp.ok) {
      if (resp.status === 429) {
        throw new Error(
          "Rate limit exceeded: Too many requests. Please wait 30 seconds and try again.",
        );
      }
      const errorBody = await resp.json().catch(() => null);
      const message =
        errorBody?.error?.message || `${resp.status} ${resp.statusText}`;
      throw new Error(message);
    }
    const { records } = await resp.json();
    const savedItem = {
      id: records[0].id,
      ...records[0].fields,
    };
    addInventoryItem(savedItem);
    return true;
  } catch (error) {
    setError(error.message);
    return false;
  } finally {
    setIsSaving(false);
  }
};

export const patchInventoryItem = async (id, fields) => {
  const { isDeleting: _isDeleting, ...airtableFields } = fields;
  // Coerce empty date strings to null (Airtable rejects "")
  ["ExpiresOn", "DatePurchased", "DateFrozen"].forEach((field) => {
    if (field in airtableFields && !airtableFields[field]) {
      airtableFields[field] = null;
    }
  });
  const patchFields = {
    ...airtableFields,
    LastUpdated: new Date().toISOString(),
  };
  const options = {
    method: "PATCH",
    headers: {
      Authorization: AUTH_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: patchFields }),
  };
  let resp;
  try {
    resp = await throttledFetch(
      `${BASE_URL}/${encodeURIComponent(id)}`,
      options,
    );
  } catch {
    throw new Error(
      "Network error: Unable to reach the server. Check your internet connection.",
    );
  }
  if (!resp.ok) {
    if (resp.status === 429) {
      throw new Error(
        "Rate limit exceeded: Too many requests. Please wait 30 seconds and try again.",
      );
    }
    const errorBody = await resp.json().catch(() => null);
    const message =
      errorBody?.error?.message || `${resp.status} ${resp.statusText}`;
    throw new Error(message);
  }
  const record = await resp.json();
  return {
    id: record.id,
    ...record.fields,
  };
};

export const deleteInventoryItem = async (id) => {
  const options = {
    method: "DELETE",
    headers: {
      Authorization: AUTH_TOKEN,
    },
  };
  let resp;
  try {
    resp = await throttledFetch(
      `${BASE_URL}/${encodeURIComponent(id)}`,
      options,
    );
  } catch {
    throw new Error(
      "Network error: Unable to reach the server. Check your internet connection.",
    );
  }
  // 404 means the record is already gone — treat as success
  if (resp.status === 404) {
    return { id, deleted: true };
  }
  if (!resp.ok) {
    if (resp.status === 429) {
      throw new Error(
        "Rate limit exceeded: Too many requests. Please wait 30 seconds and try again.",
      );
    }
    const errorBody = await resp.json().catch(() => null);
    const message =
      errorBody?.error?.message || `${resp.status} ${resp.statusText}`;
    throw new Error(message);
  }
  const result = await resp.json();
  return result;
};
