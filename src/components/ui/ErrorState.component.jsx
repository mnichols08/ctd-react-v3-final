function ErrorState({ error, onRetry }) {
  if (!error) return null;

  return (
    <div role="alert" aria-live="polite">
      <p>Error: {error}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorState;
