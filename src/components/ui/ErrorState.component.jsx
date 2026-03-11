import { memo } from "react";
import {
  useInventoryData,
  useInventoryActions,
} from "../../context/InventoryContext";
import { hasAirtableConfig } from "../../data/airtableUtils";
import {
  ErrorContainer,
  ErrorMessage,
  ErrorDetails,
  ErrorButton,
} from "./ErrorState.styles";

function ErrorState() {
  const { error, canLoadSampleDataFallback } = useInventoryData();
  const { refetch, loadSampleDataFallback } = useInventoryActions();

  if (!error) return null;

  return (
    <ErrorContainer role="alert" aria-live="assertive">
      <ErrorMessage>Error: {error}</ErrorMessage>
      {!hasAirtableConfig() && (
        <ErrorDetails>
          Airtable environment variables are not fully configured. Please set
          <br />
          VITE_AIRTABLE_PAT, VITE_AIRTABLE_BASE_ID, and VITE_AIRTABLE_TABLE_NAME
          <br />
          for local development. See .env.example for details.
        </ErrorDetails>
      )}
      {canLoadSampleDataFallback && loadSampleDataFallback && (
        <ErrorButton type="button" onClick={loadSampleDataFallback}>
          Load sample data
        </ErrorButton>
      )}
      {refetch && (
        <ErrorButton type="button" onClick={refetch}>
          Retry
        </ErrorButton>
      )}
    </ErrorContainer>
  );
}

export default memo(ErrorState);
