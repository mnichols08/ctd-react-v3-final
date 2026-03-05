export const EXPIRING_SOON_MS = 14 * 24 * 60 * 60 * 1000;
export const LOW_STOCK_THRESHOLD = 5;

export function isExpiringSoon(item) {
  if (!item.ExpiresOn) return false;
  const expiresAt = new Date(item.ExpiresOn);
  const timeUntilExpiration = expiresAt.getTime() - Date.now();
  if (Number.isNaN(timeUntilExpiration)) return false;
  return timeUntilExpiration >= 0 && timeUntilExpiration < EXPIRING_SOON_MS;
}

export function isLowStock(item) {
  return item.QtyOnHand < LOW_STOCK_THRESHOLD;
}
