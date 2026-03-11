// src/components/sections/ToolSection.styles.js
import styled from "styled-components";

export const Section = styled.section`
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  padding: 1rem 0.75rem 1.25rem 0.75rem;
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  @media (min-width: 481px) {
    padding: 1.5rem 2rem 2rem 2rem;
    margin-bottom: 2rem;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 0.5em 0;
  color: var(--color-text);
  @media (min-width: 481px) {
    font-size: 1.35rem;
  }
`;
