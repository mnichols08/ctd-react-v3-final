export const EXPIRING_SOON_MS = 14 * 24 * 60 * 60 * 1000;
export const LOW_STOCK_THRESHOLD = 5;

// Utility functions for status calculations and filtering logic
export function isExpiringSoon(item) {
  if (!item.ExpiresOn) return false;
  const expiresAt = new Date(item.ExpiresOn);
  if (Number.isNaN(expiresAt.getTime())) return false;
  // Normalize to UTC start-of-day so items expiring today are still counted
  const now = new Date();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const timeUntilExpiration = expiresAt.getTime() - todayUTC;
  return timeUntilExpiration >= 0 && timeUntilExpiration < EXPIRING_SOON_MS;
}

export const isLowStock = (item) => item.QtyOnHand < LOW_STOCK_THRESHOLD;

export const countExpiringSoon = (items) =>
  items.filter((item) => isExpiringSoon(item)).length;
