function LoadingState({ isLoading }) {
  return <div role="status">{isLoading ? <p>Loading...</p> : null}</div>;
}

export default LoadingState;
