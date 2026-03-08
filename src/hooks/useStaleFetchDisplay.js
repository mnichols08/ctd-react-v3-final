import { useEffect, useReducer } from "react";
import { formatRelativeTime } from "../data/inventoryUtils";

const initialState = { lastFetchedAtDisplay: "", isStale: false };

function staleFetchReducer(state, action) {
  switch (action.type) {
    case "update":
      return {
        lastFetchedAtDisplay: action.payload.display,
        isStale: action.payload.isStale,
      };
    default:
      return state;
  }
}

export default function useStaleFetchDisplay(lastFetchedAt, staleTimeMs) {
  const [state, dispatch] = useReducer(staleFetchReducer, initialState);

  useEffect(() => {
    if (!lastFetchedAt) return;

    const updateDisplay = () => {
      dispatch({
        type: "update",
        payload: {
          display: formatRelativeTime(lastFetchedAt),
          isStale: staleTimeMs
            ? Date.now() - lastFetchedAt.getTime() >= staleTimeMs
            : false,
        },
      });
    };
    updateDisplay();
    const interval = setInterval(updateDisplay, 30000);
    return () => clearInterval(interval);
  }, [lastFetchedAt, staleTimeMs]);

  return {
    lastFetchedAtDisplay: state.lastFetchedAtDisplay,
    isStale: state.isStale,
  };
}
