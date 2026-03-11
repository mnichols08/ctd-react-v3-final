// src/components/sections/InventorySection.styles.js
import styled from "styled-components";

export const SectionContainer = styled.section`
  width: 100%;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  padding: 1rem 0.5rem;
  margin-bottom: 1.5rem;
  @media (min-width: 481px) {
    padding: 2rem 2rem;
    margin-bottom: 2rem;
  }
`;

export const SectionHeading = styled.h2`
  font-size: var(--text-lg);
  color: var(--color-text);
  margin-bottom: 0.5rem;
  font-weight: var(--font-semibold);
`;

export const CollapseButton = styled.button`
  min-width: 44px;
  min-height: 44px;
  font-size: 1rem;
  border-radius: var(--radius-md);
  border: none;
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  font-weight: 600;
  padding: 0.25rem 1.25rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: background 0.2s;
  &:hover,
  &:focus {
    background: var(--color-primary-hover);
  }
`;

export const ItemsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const CollapsedText = styled.p`
  color: var(--color-text-muted);
  font-style: italic;
  margin: 0 0 1rem 0;
`;
