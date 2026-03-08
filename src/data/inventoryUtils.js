export const EXPIRING_SOON_MS = 14 * 24 * 60 * 60 * 1000;
export const LOW_STOCK_THRESHOLD = 5;

// Utility functions for status calculations and filtering logic
export function isExpiringSoon(item) {
  if (!item.ExpiresOn) return false;
  const expiresAt = new Date(item.ExpiresOn);
  if (Number.isNaN(expiresAt.getTime())) return false;
  // Normalize to UTC start-of-day so items expiring today are still counted
  const now = new Date();
  const todayUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const timeUntilExpiration = expiresAt.getTime() - todayUTC;
  return timeUntilExpiration >= 0 && timeUntilExpiration <= EXPIRING_SOON_MS;
}

export const isLowStock = (item) => item.QtyOnHand < LOW_STOCK_THRESHOLD;

export function getActiveFilterCount(filters) {
  return (
    (filters.categories.length > 0 ? 1 : 0) +
    (filters.expiringSoon ? 1 : 0) +
    (filters.lowStock ? 1 : 0)
  );
}

export const countExpiringSoon = (items) =>
  items.filter((item) => isExpiringSoon(item)).length;

const STRING_SORT_FIELDS = ["ItemName", "Category"];
const NUMERIC_SORT_FIELDS = ["QtyOnHand"];
const DATE_SORT_FIELDS = ["ExpiresOn", "LastUpdated"];

export function sortItems(items, sortField, sortDirection) {
  if (!sortField) return items;
  return [...items].sort((a, b) => {
    const aValue = a[sortField] ?? "";
    const bValue = b[sortField] ?? "";
    const dir = sortDirection === "asc" ? 1 : -1;
    if (STRING_SORT_FIELDS.includes(sortField)) {
      return String(aValue).localeCompare(String(bValue)) * dir;
    }
    if (NUMERIC_SORT_FIELDS.includes(sortField)) {
      return (Number(aValue) - Number(bValue)) * dir;
    }
    if (DATE_SORT_FIELDS.includes(sortField)) {
      const aEmpty = !aValue;
      const bEmpty = !bValue;
      if (aEmpty && bEmpty) return 0;
      if (aEmpty) return 1;
      if (bEmpty) return -1;
      return (new Date(aValue).getTime() - new Date(bValue).getTime()) * dir;
    }
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
}

export function formatRelativeTime(timestamp) {
  if (timestamp == null) {
    return null;
  }
  const now = Date.now();
  const diff = now - timestamp;
  if (diff < 60 * 1000) return "Just now";
  if (diff < 60 * 60 * 1000) {
    const mins = Math.round(diff / (60 * 1000));
    return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  }
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.round(diff / (60 * 60 * 1000));
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else {
    const days = Math.round(diff / (24 * 60 * 60 * 1000));
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }
}

// Auto-refresh if data is older than this threshold (5 minutes)
export const STALE_TIME_MS = 5 * 60 * 1000;
// How often to check for stale data while the tab is visible (60 seconds)
export const STALE_CHECK_INTERVAL_MS = 60 * 1000;

/** Returns true if lastFetchedAt is older than the given threshold. */
export function isDataStale(lastFetchedAt, threshold = STALE_TIME_MS) {
  if (!lastFetchedAt) return false;
  return Date.now() - lastFetchedAt.getTime() >= threshold;
}

/** Shallow-compare two arrays by length + strict element equality. */
export function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/** Deep-compare two fetch-param objects ({sortField, sortDirection, filters, searchTerm}). */
export function fetchParamsEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (
    a.sortField !== b.sortField ||
    a.sortDirection !== b.sortDirection ||
    a.searchTerm !== b.searchTerm
  ) {
    return false;
  }
  const fa = a.filters;
  const fb = b.filters;
  if (fa === fb) return true;
  if (!fa || !fb) return false;
  if (
    fa.expiringSoon !== fb.expiringSoon ||
    fa.lowStock !== fb.lowStock ||
    fa.status !== fb.status
  ) {
    return false;
  }
  return arraysEqual(fa.categories ?? [], fb.categories ?? []);
}
