import { useEffect, useState } from "react";
import { formatRelativeTime } from "../data/inventoryUtils";

export default function useStaleFetchDisplay(lastFetchedAt, staleTimeMs) {
  const [lastFetchedAtDisplay, setDisplay] = useState("");
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    if (!lastFetchedAt) return;

    const updateDisplay = () => {
      setDisplay(formatRelativeTime(lastFetchedAt));
      setIsStale(
        staleTimeMs
          ? Date.now() - lastFetchedAt.getTime() >= staleTimeMs
          : false,
      );
    };
    updateDisplay();
    const interval = setInterval(updateDisplay, 30000);
    return () => clearInterval(interval);
  }, [lastFetchedAt, staleTimeMs]);

  return { lastFetchedAtDisplay, isStale };
}
