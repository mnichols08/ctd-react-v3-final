import { useEffect, useRef } from "react";
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
        refetch({ silent: true });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [lastFetchedAt, isLoading, refetch]);

  // Periodic stale-check while the tab stays visible
  useEffect(() => {
    if (import.meta.env.VITE_SAMPLE_DATA === "true") return;

    const id = setInterval(() => {
      if (
        document.visibilityState === "visible" &&
        isDataStale(lastFetchedAt) &&
        !isLoading
      ) {
        refetch({ silent: true });
      }
    }, STALE_CHECK_INTERVAL_MS);

    return () => clearInterval(id);
  }, [lastFetchedAt, isLoading, refetch]);
}
