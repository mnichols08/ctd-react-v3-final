import { memo } from "react";
import { useInventoryData } from "../../context/InventoryContext";

function LoadingState() {
  const { isLoading } = useInventoryData();
  if (!isLoading) return null;
  return (
    <div role="status">
      <p>Loading...</p>
    </div>
  );
}

export default memo(LoadingState);
