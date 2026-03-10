import sampleData from "./inventoryData.json";

export const LOCAL_INVENTORY_STORAGE_KEY = "ctd-react-v3-final.inventory-items";

export const LOCAL_INVENTORY_SAVE_ERROR =
  "Local storage is unavailable. Changes were applied for this session only.";

function sanitizeInventoryItems(items) {
  return items.map(({ isDeleting: _isDeleting, ...item }) => ({ ...item }));
}

function getSeedInventoryItems() {
  return sanitizeInventoryItems(sampleData.records);
}

export function readLocalInventoryItems() {
  if (typeof window === "undefined") {
    return getSeedInventoryItems();
  }

  const rawItems = window.localStorage.getItem(LOCAL_INVENTORY_STORAGE_KEY);
  if (!rawItems) {
    const seededItems = getSeedInventoryItems();
    window.localStorage.setItem(
      LOCAL_INVENTORY_STORAGE_KEY,
      JSON.stringify(seededItems),
    );
    return seededItems;
  }

  try {
    const parsedItems = JSON.parse(rawItems);
    if (!Array.isArray(parsedItems)) {
      throw new Error("Stored inventory payload must be an array.");
    }
    return sanitizeInventoryItems(parsedItems);
  } catch (error) {
    console.warn(
      "Failed to parse inventory from localStorage. Resetting to seeded data.",
      error,
    );
    const seededItems = getSeedInventoryItems();
    window.localStorage.setItem(
      LOCAL_INVENTORY_STORAGE_KEY,
      JSON.stringify(seededItems),
    );
    return seededItems;
  }
}

export function saveLocalInventoryItems(items) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.setItem(
      LOCAL_INVENTORY_STORAGE_KEY,
      JSON.stringify(sanitizeInventoryItems(items)),
    );
    return true;
  } catch (error) {
    console.error("Failed to save inventory to localStorage.", error);
    return false;
  }
}

export function clearLocalInventoryItems() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(LOCAL_INVENTORY_STORAGE_KEY);
}

export function loadLocalInventory({
  setInventoryItems,
  setIsLoading,
  setError,
  setLastFetchedAt = () => {},
}) {
  setIsLoading(true);
  setError(null);

  try {
    const localItems = readLocalInventoryItems();
    setInventoryItems(localItems);
    setLastFetchedAt(new Date());
  } catch (error) {
    console.error(error);
    setError("Unable to load inventory from local storage.");
    setInventoryItems([]);
  } finally {
    setIsLoading(false);
  }
}
