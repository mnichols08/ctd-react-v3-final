import { memo } from "react";
import { useInventoryData } from "../../context/InventoryContext";

function LoadingState() {
  const { isLoading, loadingProgress } = useInventoryData();
  if (!isLoading) return null;
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <p>Loading…{loadingProgress != null && ` ${loadingProgress} items`}</p>
    </div>
  );
}

export default memo(LoadingState);
