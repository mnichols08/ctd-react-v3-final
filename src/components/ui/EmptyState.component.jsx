import { memo } from "react";
import { EmptyContainer, EmptyMessage } from "./EmptyState.styles";

function EmptyState({ title }) {
  return (
    <EmptyContainer role="status" aria-live="polite">
      <EmptyMessage>Items in the {title} will be listed here.</EmptyMessage>
    </EmptyContainer>
  );
}

export default memo(EmptyState);
