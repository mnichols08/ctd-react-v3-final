// src/components/ui/ConfirmDialog.styles.js
import styled from "styled-components";

export const DialogContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1.25rem 1.25rem 1.25rem;
  min-width: 220px;
  max-width: 90vw;
`;

export const DialogMessage = styled.p`
  color: var(--color-text);
  font-size: var(--text-md);
  margin: 0 0 1.25rem 0;
  text-align: center;
`;

export const DialogButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  width: 100%;
  justify-content: center;
  margin-top: 0.5rem;
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.5rem;
    & > button {
      width: 100%;
    }
  }
`;

export const DialogButton = styled.button`
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
  transition: background 0.2s;
  &:hover,
  &:focus {
    background: var(--color-primary-hover);
  }
`;

export const DialogButtonDanger = styled(DialogButton)`
  background: var(--color-danger);
  &:hover,
  &:focus {
    background: var(--color-danger-hover, #b3001b);
  }
`;
