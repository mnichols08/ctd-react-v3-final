import { memo } from "react";
import { useInventoryData } from "../../context/InventoryContext";
import { countExpiringSoon, STALE_TIME_MS } from "../../data/inventoryUtils";
import useStaleFetchDisplay from "../../hooks/useStaleFetchDisplay";
import { StatsGrid, StatCard, StatTitle, StatValue, StatsInfo } from "./QuickStatsBar.styles";

function QuickStatsBar() {
  const {
    items,
    filterAppliedItems,
    searchTerm,
    activeFilterCount,
    lastFetchedAt,
  } = useInventoryData();

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
      {isFiltered && <StatsInfo>Showing stats for filtered items</StatsInfo>}
      <StatsGrid>
        <StatCard>
          <StatTitle>Total Items</StatTitle>
          <StatValue>{totalItems}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Need Restock</StatTitle>
          <StatValue>{needRestock}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Expiring Soon</StatTitle>
          <StatValue>{expiringSoon}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Shopping List</StatTitle>
          <StatValue>{shoppingList}</StatValue>
        </StatCard>
      </StatsGrid>
      {lastFetchedAtDisplay && (
        <StatsInfo>
          Last updated: {lastFetchedAtDisplay}
          {isStale && " (stale)"}
        </StatsInfo>
      )}
    </>
  );
}

export default memo(QuickStatsBar);
