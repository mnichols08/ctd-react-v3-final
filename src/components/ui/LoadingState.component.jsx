function LoadingState({ isLoading }) {
  return <div role="status" aria-live="polite">{isLoading ? <p>Loading...</p> : null}</div>;
}

export default LoadingState;
