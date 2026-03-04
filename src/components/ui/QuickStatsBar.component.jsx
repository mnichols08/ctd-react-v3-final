function QuickStatsBar({ inventoryItems }) {
  const activeItems = inventoryItems.filter(
    (item) => item.Status !== "archived",
  );
  const totalItems = activeItems.length;
  const expirationThresholdMs = 7 * 24 * 60 * 60 * 1000;
  const now = new Date();
  const expiringSoon = inventoryItems.filter((item) => {
    if (!item.ExpiresOn) {
      return false;
    }
    const expiresAt = new Date(item.ExpiresOn);
    const timeUntilExpiration = expiresAt.getTime() - now.getTime();
    if (Number.isNaN(timeUntilExpiration)) {
      return false;
    }
    return (
      timeUntilExpiration >= 0 && timeUntilExpiration < expirationThresholdMs
    );
  }).length;
  const lowStock = activeItems.filter((item) => item.QtyOnHand < 5).length;
  const categories = [...new Set(activeItems.map((item) => item.Category))]
    .length;
  const archivedItems = inventoryItems.filter(
    (item) => item.Status === "archived",
  ).length;

  return (
    <>
      <div>
        <h3>Active Items</h3>
        <p>{totalItems}</p>
      </div>
      <div>
        <h3>Expiring Soon</h3>
        <p>{expiringSoon}</p>
      </div>
      <div>
        <h3>Low Stock</h3>
        <p>{lowStock}</p>
      </div>
      <div>
        <h3>Categories</h3>
        <p>{categories}</p>
      </div>
      {archivedItems > 0 && (
        <div>
          <h3>Archived Items</h3>
          <p>{archivedItems}</p>
        </div>
      )}
    </>
  );
}

export default QuickStatsBar;
