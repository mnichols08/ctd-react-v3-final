import { memo } from "react";
import {
  useInventoryData,
  useInventoryActions,
} from "../../context/InventoryContext";

function ErrorState() {
  const { error } = useInventoryData();
  const { refetch } = useInventoryActions();
  if (!error) return null;

  return (
    <div role="alert">
      <p>Error: {error}</p>
      {refetch && (
        <button type="button" onClick={refetch}>
          Retry
        </button>
      )}
    </div>
  );
}

export default memo(ErrorState);
