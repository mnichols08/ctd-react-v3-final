import { memo } from "react";
import { Section, SectionTitle } from "./ToolSection.styles";

function ToolSection({ id, title, children }) {
  return (
    <Section id={id}>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </Section>
  );
}

export default memo(ToolSection);
