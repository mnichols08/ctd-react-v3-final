// src/components/forms/EditInventoryItemForm.styles.js
import styled from "styled-components";

export const EditFormContainer = styled.form`
  width: 100%;
  max-width: 480px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  padding: 1.5rem 1rem 1rem 1rem;
  margin: 0 auto 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  @media (min-width: 481px) {
    max-width: 540px;
    padding: 2.5rem 2rem 1.5rem 2rem;
    gap: 2rem;
  }
`;

export const EditButton = styled.button`
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
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  &:hover,
  &:focus {
    background: var(--color-primary-hover);
  }
`;

export const CancelButton = styled(EditButton)`
  background: var(--color-secondary);
  &:hover,
  &:focus {
    background: var(--color-secondary-hover);
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
    width: 100%;
    & > button {
      width: 100%;
      margin-right: 0;
    }
  }
`;
