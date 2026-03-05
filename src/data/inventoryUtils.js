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
