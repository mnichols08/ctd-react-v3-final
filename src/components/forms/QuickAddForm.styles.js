// src/components/forms/QuickAddForm.styles.js
import styled from "styled-components";

export const QuickAddFormContainer = styled.form`
  width: 100%;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  padding: 0.75rem 0.5rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  @media (min-width: 481px) {
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
    gap: 1.25rem;
  }
`;

export const QuickFieldset = styled.fieldset`
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const QuickLegend = styled.legend`
  font-size: 1.1rem;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
`;

export const QuickFormRow = styled.p`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0;
`;

export const QuickLabel = styled.label`
  font-size: 1rem;
  color: var(--color-text);
  font-weight: 500;
`;

export const QuickInput = styled.input`
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

export const QuickSelect = styled.select`
  min-width: 44px;
  min-height: 44px;
  font-size: 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  padding: 0.25rem 0.5rem;
  background: var(--color-surface);
  color: var(--color-text);
`;

export const QuickButton = styled.button`
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
