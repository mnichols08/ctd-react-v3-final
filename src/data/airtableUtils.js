import sampleData from "./inventorySample.json";

const BASE_URL = `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/${encodeURIComponent(import.meta.env.VITE_AIRTABLE_TABLE_NAME)}`;
const AUTH_TOKEN = `Bearer ${import.meta.env.VITE_AIRTABLE_PAT}`;

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
      resp = await fetch(BASE_URL, options);
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
