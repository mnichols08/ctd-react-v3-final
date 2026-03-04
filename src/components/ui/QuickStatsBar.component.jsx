function QuickStatsBar({ inventoryItems }) {
  const totalItems = inventoryItems.length;
  const expiringSoon = inventoryItems.filter(
    (item) =>
      new Date(item.ExpiresOn) - new Date() < 7 * 24 * 60 * 60 * 1000,
  ).length;
  const lowStock = inventoryItems.filter((item) => item.QtyOnHand < 5).length;
  const categories = [...new Set(inventoryItems.map((item) => item.Category))]
    .length;
  const archivedItems = inventoryItems.filter(
    (item) => item.Status === "archived",
  ).length;

  return (
    <>
      <div>
        <h3>Total Items</h3>
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
      <div>
        <h3>Archived Items</h3>
        <p>{archivedItems}</p>
      </div>
    </>
  );
}

export default QuickStatsBar;
