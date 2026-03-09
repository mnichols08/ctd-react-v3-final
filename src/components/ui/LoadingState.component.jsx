import { memo } from "react";

function LoadingState({ isLoading }) {
  if (!isLoading) return null;
  return (
    <div role="status">
      <p>Loading...</p>
    </div>
  );
}

export default memo(LoadingState);
