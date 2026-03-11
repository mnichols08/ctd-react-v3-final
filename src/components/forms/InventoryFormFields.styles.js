// src/components/forms/InventoryFormFields.styles.js
import styled from "styled-components";

export const StyledFieldset = styled.fieldset`
  border: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: none;
`;

export const StyledLegend = styled.legend`
  font-size: 1.1rem;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
`;

export const StyledLabel = styled.label`
  font-size: 1rem;
  color: var(--color-text);
  font-weight: 500;
`;

export const StyledInput = styled.input`
  font-size: 1rem;
  color: var(--color-text);
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  padding: 0.25rem 0.5rem;
  min-width: 44px;
  min-height: 44px;
  &::placeholder {
    color: var(--color-text-subtle);
    opacity: 1;
  }
`;

export const StyledTextarea = styled.textarea`
  font-size: 1rem;
  color: var(--color-text);
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  padding: 0.25rem 0.5rem;
  min-width: 44px;
  min-height: 44px;
  resize: vertical;
`;

export const StyledSelect = styled.select`
  min-width: 44px;
  min-height: 44px;
  font-size: 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  padding: 0.25rem 0.5rem;
  background: var(--color-surface);
  color: var(--color-text);
`;
