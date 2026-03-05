import { isExpiringSoon, isLowStock } from "../../data/inventoryUtils";

function QuickStatsBar({ inventoryItems }) {
  const activeItems = inventoryItems.filter(
    (item) => item.Status !== "archived",
  );
  const totalItems = activeItems.length;
  const expiringSoon = activeItems.filter(isExpiringSoon).length;
  const lowStock = activeItems.filter(isLowStock).length;
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
