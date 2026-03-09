import { memo } from "react";
import { useInventoryContext } from "../../context/InventoryContext";
import { countExpiringSoon, STALE_TIME_MS } from "../../data/inventoryUtils";
import useStaleFetchDisplay from "../../hooks/useStaleFetchDisplay";

function QuickStatsBar() {
  const {
    items,
    filterAppliedItems,
    searchTerm,
    activeFilterCount,
    lastFetchedAt,
  } = useInventoryContext();

  const isFiltered = searchTerm.trim() !== "" || activeFilterCount > 0;
  const sourceItems = isFiltered ? filterAppliedItems : items;
  const activeItems = sourceItems.filter((item) => item.Status !== "archived");

  const totalItems = activeItems.length;
  const needRestock = activeItems.filter(
    (item) => item.NeedRestock === true,
  ).length;
  const expiringSoon = countExpiringSoon(activeItems);
  const shoppingList = activeItems.filter(
    (item) => item.NeedRestock === true && item.TargetQty > item.QtyOnHand,
  ).length;
  const { lastFetchedAtDisplay, isStale } = useStaleFetchDisplay(
    lastFetchedAt,
    STALE_TIME_MS,
  );
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
