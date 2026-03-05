import { countExpiringSoon } from "../../data/inventoryUtils";

function QuickStatsBar({ inventoryItems }) {
  const activeItems = inventoryItems.filter(
    (item) => item.Status !== "archived",
  );

  const totalItems = activeItems.length;
  const needRestock = activeItems.filter(
    (item) => item.NeedRestock === true,
  ).length;
  const expiringSoon = countExpiringSoon(activeItems);
  const shoppingList = activeItems.filter(
    (item) => item.NeedRestock === true && item.TargetQty > item.QtyOnHand,
  ).length;

  return (
    <>
      <div>
        <h3>Total Items</h3>
        <p>{totalItems}</p>
      </div>
      <div>
        <h3>Need Restock</h3>
        <p>{needRestock}</p>
      </div>
      <div>
        <h3>Expiring Soon</h3>
        <p>{expiringSoon}</p>
      </div>
      <div>
        <h3>Shopping List</h3>
        <p>{shoppingList}</p>
      </div>
    </>
  );
}

export default QuickStatsBar;
