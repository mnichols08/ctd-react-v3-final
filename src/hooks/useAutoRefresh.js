import { useCallback, useEffect, useRef } from "react";
import {
  isDataStale,
  fetchParamsEqual,
  STALE_CHECK_INTERVAL_MS,
} from "../data/inventoryUtils";

export default function useAutoRefresh({
  sortConfig,
  filters,
  searchTerm,
  refetch,
  lastFetchedAt,
  isLoading,
}) {
  // Track last-fetched params to prevent redundant server-side re-fetches
  const lastFetchedParamsRef = useRef({
    sortField: sortConfig.field,
    sortDirection: sortConfig.direction,
    filters,
    searchTerm,
  });

  // Guard against overlapping silent refreshes: visibility and interval
  // triggers share this flag so only one in-flight fetch runs at a time.
  const refreshingRef = useRef(false);

  // Reset when the fetch completes (lastFetchedAt updates)
  useEffect(() => {
    refreshingRef.current = false;
  }, [lastFetchedAt]);

  const silentRefresh = useCallback(() => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    refetch({ silent: true });
  }, [refetch]);

  // When server-side filtering is enabled, re-fetch on sort/filter/search changes
  useEffect(() => {
    if (
      import.meta.env.VITE_SAMPLE_DATA === "true" ||
      import.meta.env.VITE_SERVER_FILTER !== "true"
    ) {
      return;
    }
    const params = {
      sortField: sortConfig.field,
      sortDirection: sortConfig.direction,
      filters,
      searchTerm,
    };
    if (fetchParamsEqual(params, lastFetchedParamsRef.current)) {
      return;
    }
    lastFetchedParamsRef.current = params;
    refetch({
      sortConfig,
      filterConfig: filters,
      searchTerm,
    });
  }, [sortConfig, filters, searchTerm, refetch]);

  // Auto-refresh when the tab regains focus and data is stale
  useEffect(() => {
    if (import.meta.env.VITE_SAMPLE_DATA === "true") return;

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        isDataStale(lastFetchedAt) &&
        !isLoading
      ) {
        silentRefresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [lastFetchedAt, isLoading, silentRefresh]);

  // Periodic stale-check while the tab stays visible
  useEffect(() => {
    if (import.meta.env.VITE_SAMPLE_DATA === "true") return;

    const intervalId = setInterval(() => {
      if (
        document.visibilityState === "visible" &&
        isDataStale(lastFetchedAt) &&
        !isLoading
      ) {
        silentRefresh();
      }
    }, STALE_CHECK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [lastFetchedAt, isLoading, silentRefresh]);
}
