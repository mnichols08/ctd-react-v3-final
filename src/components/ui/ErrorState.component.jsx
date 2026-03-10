import { memo } from "react";
import {
  useInventoryData,
  useInventoryActions,
} from "../../context/InventoryContext";
import { hasAirtableConfig } from "../../data/airtableUtils";

function ErrorState() {
  const { error, canLoadSampleDataFallback } = useInventoryData();
  const { refetch, loadSampleDataFallback } = useInventoryActions();

  if (!error) return null;

  return (
    <div role="alert">
      <p>Error: {error}</p>
      {!hasAirtableConfig() && (
        <p>
          Airtable environment variables are not fully configured. Please set
          VITE_AIRTABLE_PAT, VITE_AIRTABLE_BASE_ID, and VITE_AIRTABLE_TABLE_NAME
          for local development. See .env.example for details.
        </p>
      )}
      {canLoadSampleDataFallback && loadSampleDataFallback && (
        <button type="button" onClick={loadSampleDataFallback}>
          Load sample data
        </button>
      )}
      {refetch && (
        <button type="button" onClick={refetch}>
          Retry
        </button>
      )}
    </div>
  );
}

export default memo(ErrorState);
