import { memo } from "react";
import { useInventoryData } from "../../context/InventoryContext";
import { LoadingContainer, LoadingMessage, Spinner } from "./LoadingState.styles";

function LoadingState() {
  const { isLoading, loadingProgress } = useInventoryData();
  if (!isLoading) return null;
  return (
    <LoadingContainer role="status" aria-live="polite" aria-busy="true">
      <Spinner aria-hidden="true" />
      <LoadingMessage>
        Loading…{loadingProgress != null && ` ${loadingProgress} items`}
      </LoadingMessage>
    </LoadingContainer>
  );
}

export default memo(LoadingState);
