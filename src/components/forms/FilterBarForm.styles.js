// src/components/forms/FilterBarForm.styles.js
import styled from "styled-components";

export const FilterBarContainer = styled.div`
  width: 100%;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  padding: 0.75rem 0.5rem;
  margin-bottom: 1rem;
  @media (min-width: 481px) {
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

export const FilterForm = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
`;

export const FilterLabel = styled.label`
  font-size: 1rem;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const FilterInput = styled.input`
  font-size: 1rem;
  color: var(--color-text);
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  padding: 0.25rem 0.5rem;
  /* Only make text/select/number inputs large for touch, not checkboxes/radios */
  ${({ type }) =>
    type === "checkbox" || type === "radio"
      ? `
        width: 18px;
        height: 18px;
        min-width: 18px;
        min-height: 18px;
        margin-right: 0.4em;
        @media (max-width: 480px) {
          width: 32px;
          height: 32px;
          min-width: 32px;
          min-height: 32px;
        }
      `
      : `
        min-width: 44px;
        min-height: 44px;
      `}
`;

export const FilterSelect = styled.select`
  min-width: 44px;
  min-height: 44px;
  font-size: 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  padding: 0.25rem 0.5rem;
  background: var(--color-surface);
  color: var(--color-text);
`;

export const FilterButton = styled.button`
  min-width: 44px;
  min-height: 44px;
  font-size: 1rem;
  border-radius: var(--radius-md);
  border: none;
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  font-weight: 600;
  padding: 0.25rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
  &:hover,
  &:focus {
    background: var(--color-primary-hover);
  }
`;

export const FilterFieldset = styled.fieldset`
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  align-items: center;
`;

export const FilterLegend = styled.legend`
  font-size: 1rem;
  color: var(--color-text-muted);
  margin-right: 0.5rem;
`;
