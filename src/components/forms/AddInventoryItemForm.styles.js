// src/components/forms/AddInventoryItemForm.styles.js
import styled from "styled-components";

export const AddFormContainer = styled.form`
  width: 100%;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  padding: 1rem 0.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  @media (min-width: 481px) {
    padding: 2rem 2rem;
    gap: 2rem;
  }
`;

export const AddButton = styled.button`
  min-width: 44px;
  min-height: 44px;
  font-size: 1rem;
  border-radius: var(--radius-md);
  border: none;
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  font-weight: 600;
  padding: 0.25rem 1.5rem;
  cursor: pointer;
  transition: background 0.2s;
  &:hover,
  &:focus {
    background: var(--color-primary-hover);
  }
`;
