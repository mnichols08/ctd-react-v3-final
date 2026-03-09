import { memo } from "react";

function ErrorState({ error, onRetry }) {
  if (!error) return null;

  return (
    <div role="alert">
      <p>{error}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export default memo(ErrorState);
