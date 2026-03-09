import { memo } from "react";

function EmptyState({ title }) {
  return <p>Items in the {title} will be listed here.</p>;
}

export default memo(EmptyState);
