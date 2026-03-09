import { memo } from "react";
import { useInventoryContext } from "../../context/InventoryContext";

function ErrorState() {
  const { error, refetch } = useInventoryContext();
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
