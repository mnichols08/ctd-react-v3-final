import sampleData from "./inventoryData.json";
import {
  EXPIRING_SOON_MS,
  LOW_STOCK_THRESHOLD,
  normalizeRecord,
} from "./inventoryUtils";
import { SEARCHABLE_FIELDS } from "./fieldConfig";

// ---------------------------------------------------------------------------
// When VITE_AIRTABLE_PAT is set, call Airtable directly (local dev).
// Otherwise, route through the Netlify serverless proxy so the PAT stays
// server-side (production).
// ---------------------------------------------------------------------------
const USE_PROXY = !import.meta.env.VITE_AIRTABLE_PAT;
const PROXY_URL = "/.netlify/functions/airtable";

const BASE_URL = USE_PROXY
  ? null // not used when proxying
  : `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/${encodeURIComponent(import.meta.env.VITE_AIRTABLE_TABLE_NAME)}`;
const AUTH_TOKEN = USE_PROXY
  ? null
  : `Bearer ${import.meta.env.VITE_AIRTABLE_PAT}`;
const EXPIRING_SOON_DAYS = EXPIRING_SOON_MS / (24 * 60 * 60 * 1000);

// ---------------------------------------------------------------------------
// Environment variable checks and warnings
// ---------------------------------------------------------------------------
export const hasAirtableConfig = () =>
  Boolean(
    import.meta.env.VITE_AIRTABLE_BASE_ID &&
    import.meta.env.VITE_AIRTABLE_TABLE_NAME,
  );
if (!USE_PROXY && !hasAirtableConfig()) {
  console.warn(
    "Airtable environment variables are not fully configured. Please set VITE_AIRTABLE_PAT, VITE_AIRTABLE_BASE_ID, and VITE_AIRTABLE_TABLE_NAME for local development. See .env.example for details. Falling back to sample data.",
  );
}

/**
 * Returns a user-friendly error message for common HTTP status codes.
 */
function friendlyErrorMessage(status) {
  switch (status) {
    case 400:
      return "Something went wrong with that request. Please check your input and try again.";
    case 401:
      return "Authentication failed: Invalid API token. Verify your VITE_AIRTABLE_PAT.";
    case 403:
      return `Access denied. You don't have permission to perform this action. Check your API token and Airtable permissions. This could also be an invalid table name. Received ${import.meta.env.VITE_AIRTABLE_TABLE_NAME} for VITE_AIRTABLE_TABLE_NAME`;
    case 404:
      return "Not found: Invalid base or table name. Verify VITE_AIRTABLE_BASE_ID and VITE_AIRTABLE_TABLE_NAME.";

    case 408:
      return "The request timed out. Please check your connection and try again.";
    case 422:
      return "The data sent was invalid. Please check your input and try again.";
    case 429:
      return "Rate limit exceeded: Too many requests. Please wait 30 seconds and try again.";
    case 500:
      return "Something went wrong on the server. Please try again in a moment.";
    case 502:
      return "The server is temporarily unavailable. Please try again shortly.";
    case 503:
      return "The service is temporarily down for maintenance. Please try again later.";
    default:
      return `Something went wrong (error ${status}). Please try again or contact support if the problem persists.`;
  }
}

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

const NETWORK_ERROR =
  "Network error: Unable to reach the server. Check your internet connection.";

// ---------------------------------------------------------------------------
// airtableFetch — unified transport that works in both modes:
//   Direct: builds the Airtable URL and attaches the PAT header
//   Proxy:  POSTs to /.netlify/functions/airtable with the intended method
//
// Accepts { method, recordId?, params?, body?, signal? }
// Returns the raw Response.
// ---------------------------------------------------------------------------
const airtableFetch = async ({ method, recordId, params, body, signal }) => {
  if (USE_PROXY) {
    const proxyBody = { method };
    if (recordId) proxyBody.recordId = recordId;
    if (params) proxyBody.params = params;
    if (body) proxyBody.body = body;
    return throttledFetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proxyBody),
      ...(signal && { signal }),
    });
  }

  // Direct mode — same as before
  let url = recordId ? `${BASE_URL}/${encodeURIComponent(recordId)}` : BASE_URL;
  if (params) url += `?${params}`;
  const headers = { Authorization: AUTH_TOKEN };
  if (body) headers["Content-Type"] = "application/json";
  return throttledFetch(url, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...(signal && { signal }),
  });
};

/**
 * Wraps airtableFetch with network-error handling, 429 detection, and error
 * body parsing.  Pass allowedStatuses (e.g. [404]) to let specific non-ok
 * codes through without throwing.
 */
const checkedFetch = async (fetchOptions, { allowedStatuses = [] } = {}) => {
  let resp;
  try {
    resp = await airtableFetch(fetchOptions);
  } catch {
    throw new Error(NETWORK_ERROR);
  }
  if (!resp.ok && !allowedStatuses.includes(resp.status)) {
    if (resp.status === 429) {
      throw new Error(
        "Rate limit exceeded: Too many requests. Please wait 30 seconds and try again.",
      );
    }
    const errorBody = await resp.json().catch(() => null);
    throw new Error(
      errorBody?.error?.message || `${resp.status} ${resp.statusText}`,
    );
  }
  return resp;
};

const MAX_PAGES = 50; // Safety cap: 50 pages × 100 records = 5,000 items

export const fetchInventoryItems = async ({
  setInventoryItems,
  setIsLoading,
  setError,
  sortConfig,
  filterConfig,
  searchTerm,
  setLastFetchedAt = () => {},
  onProgress = () => {},
  setPartialLoadWarning = () => {},
  signal,
}) => {
  setIsLoading(true);
  setError(null);
  setPartialLoadWarning(null);
  onProgress(null);
  // When server-side filtering is enabled, append sort/filter params to the URL
  const useServerFilter = import.meta.env.VITE_SERVER_FILTER === "true";
  let baseParams = useServerFilter
    ? buildAirtableParams(sortConfig, filterConfig, searchTerm)
    : new URLSearchParams();

  try {
    const allRecords = [];
    let offset = undefined;
    let page = 0;

    while (page < MAX_PAGES) {
      page++;
      const params = new URLSearchParams(baseParams);
      if (offset) params.set("offset", offset);
      const paramString = params.toString();

      let resp;
      try {
        resp = await airtableFetch({
          method: "GET",
          params: paramString || undefined,
          signal,
        });
      } catch (fetchErr) {
        // First page network error is fatal; later pages keep partial data
        if (allRecords.length === 0) throw new Error(NETWORK_ERROR);
        console.error(fetchErr);
        setPartialLoadWarning(
          `Loaded ${allRecords.length} items but couldn't fetch the rest. Some items may be missing.`,
        );
        break;
      }

      if (!resp.ok) {
        // On 422 with server-side params on the first page, fall back to unfiltered
        if (
          resp.status === 422 &&
          useServerFilter &&
          paramString &&
          page === 1
        ) {
          console.warn(
            "Airtable returned 422 for query params — falling back to unfiltered fetch.",
          );
          let fallbackResp;
          try {
            fallbackResp = await airtableFetch({ method: "GET", signal });
          } catch {
            throw new Error(NETWORK_ERROR);
          }
          if (!fallbackResp.ok) {
            throw new Error(friendlyErrorMessage(fallbackResp.status));
          }
          resp = fallbackResp;
          baseParams = new URLSearchParams();
        } else if (allRecords.length === 0) {
          // First page non-ok is fatal
          throw new Error(friendlyErrorMessage(resp.status));
        } else {
          // Later page failure — keep partial data
          console.error(`Page ${page} failed with status ${resp.status}`);
          setPartialLoadWarning(
            `Loaded ${allRecords.length} items but couldn't fetch the rest. Some items may be missing.`,
          );
          break;
        }
      }

      const data = await resp.json();
      allRecords.push(...data.records);

      if (allRecords.length > 0) {
        onProgress(allRecords.length);
      }

      offset = data.offset;
      if (!offset) break; // No more pages
    }

    if (page >= MAX_PAGES && offset) {
      console.warn(
        `Pagination stopped at ${MAX_PAGES} pages (${allRecords.length} records).`,
      );
      setPartialLoadWarning(
        `Loaded ${allRecords.length} items but more may exist. Display is capped for performance.`,
      );
    }

    setInventoryItems(
      allRecords.map((record) =>
        normalizeRecord({
          id: record.id,
          ...record.fields,
        }),
      ),
    );
    setLastFetchedAt(new Date());
  } catch (error) {
    if (signal?.aborted) return; // Request was intentionally cancelled
    console.error(error);
    setError(error.message);
  } finally {
    if (!signal?.aborted) {
      setIsLoading(false);
      onProgress(null);
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

  try {
    setError(null);
    setIsSaving(true);
    const resp = await checkedFetch({ method: "POST", body: payload });
    const { records } = await resp.json();
    const savedItem = normalizeRecord({
      id: records[0].id,
      ...records[0].fields,
    });
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
  // Coerce empty date strings to null (Airtable rejects "")
  const airtableFields = { ...fields };
  ["ExpiresOn", "DatePurchased", "DateFrozen"].forEach((field) => {
    if (field in airtableFields && !airtableFields[field]) {
      airtableFields[field] = null;
    }
  });
  const patchFields = {
    ...airtableFields,
    LastUpdated: new Date().toISOString(),
  };
  const resp = await checkedFetch({
    method: "PATCH",
    recordId: id,
    body: { fields: patchFields },
  });
  const record = await resp.json();
  return normalizeRecord({
    id: record.id,
    ...record.fields,
  });
};

export const deleteInventoryItem = async (id) => {
  // 404 means the record is already gone — treat as success
  const resp = await checkedFetch(
    { method: "DELETE", recordId: id },
    { allowedStatuses: [404] },
  );
  if (resp.status === 404) {
    return { id, deleted: true };
  }
  return resp.json();
};
