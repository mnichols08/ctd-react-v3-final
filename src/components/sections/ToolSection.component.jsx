import { memo } from "react";

function ToolSection({ id, title, children }) {
  return (
    <section id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default memo(ToolSection);
