import { memo, useEffect, useState } from "react";
import {
  countExpiringSoon,
  formatRelativeTime,
} from "../../data/inventoryUtils";

function QuickStatsBar({
  inventoryItems = [],
  filteredItems = [],
  isFiltered = false,
  lastFetchedAt,
  staleTimeMs,
} = {}) {
  const sourceItems = isFiltered ? filteredItems : inventoryItems;
  const activeItems = sourceItems.filter((item) => item.Status !== "archived");

  const totalItems = activeItems.length;
  const needRestock = activeItems.filter(
    (item) => item.NeedRestock === true,
  ).length;
  const expiringSoon = countExpiringSoon(activeItems);
  const shoppingList = activeItems.filter(
    (item) => item.NeedRestock === true && item.TargetQty > item.QtyOnHand,
  ).length;
  const [lastFetchedAtDisplay, setLastFetchedAtDisplay] = useState("");
  const [isStale, setIsStale] = useState(false);
  useEffect(() => {
    if (lastFetchedAt) {
      const updateDisplay = () => {
        setLastFetchedAtDisplay(formatRelativeTime(lastFetchedAt));
        if (staleTimeMs) {
          setIsStale(Date.now() - lastFetchedAt.getTime() >= staleTimeMs);
        }
      };
      updateDisplay();
      const interval = setInterval(() => {
        updateDisplay();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [lastFetchedAt, staleTimeMs]);
  return (
    <>
      {isFiltered && <p>Showing stats for filtered items</p>}
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
      {lastFetchedAtDisplay && (
        <p>
          Last updated: {lastFetchedAtDisplay}
          {isStale && " (stale)"}
        </p>
      )}
    </>
  );
}

export default memo(QuickStatsBar);
