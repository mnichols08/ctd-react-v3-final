import sampleData from "./inventorySample.json";

const BASE_URL = `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/${encodeURIComponent(import.meta.env.VITE_AIRTABLE_TABLE_NAME)}`;
const AUTH_TOKEN = `Bearer ${import.meta.env.VITE_AIRTABLE_PAT}`;

// --- Client-side rate limiter (Airtable allows 5 requests/sec) ---
const MAX_REQUESTS_PER_SECOND = 3; // Set to 3 to be safe and avoid hitting the limit
const requestTimestamps = [];

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
}) => {
  setIsLoading(true);
  setError(null);
  const options = {
    method: "GET",
    headers: {
      Authorization: AUTH_TOKEN,
    },
  };
  try {
    let resp;
    try {
      resp = await throttledFetch(BASE_URL, options);
    } catch {
      throw new Error(
        "Network error: Unable to reach the server. Check your internet connection.",
      );
    }
    if (!resp.ok) {
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
    const { records } = await resp.json();
    setInventoryItems(
      records.map((record) => {
        const item = {
          id: record.id,
          ...record.fields,
        };
        if (!record.fields.isCompleted) {
          item.isCompleted = false;
        }
        return item;
      }),
    );
  } catch (error) {
    console.error(error);
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};

export const loadSampleData = ({
  setInventoryItems,
  setIsLoading,
  setError,
}) => {
  setIsLoading(true);
  setError(null);
  const randomFailure = Math.random() < 0.33; // 33% chance of failure
  if (randomFailure) {
    setError("Failed to load sample data. Please try again.");
    setIsLoading(false);
    return;
  }
  setInventoryItems(sampleData.records.map((item) => ({ ...item })));
  const simulateLoad = setTimeout(() => {
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
    if (!records[0].fields.isCompleted) {
      savedItem.isCompleted = false;
    }
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
  const patchFields = {
    ...fields,
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
