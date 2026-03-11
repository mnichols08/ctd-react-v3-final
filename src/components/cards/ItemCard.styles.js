export const CardDetailsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media (min-width: 480px) and (max-width: 800px) {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
  }
`;

export const CardProperties = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 2 1 0;
`;

export const CardActions = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  flex: 1 1 0;
  align-items: flex-end;
  justify-content: flex-end;

  @media (min-width: 480px) and (max-width: 800px) {
    flex-wrap: wrap;
    gap: 0.75rem;
    padding-right: 0;
    & > button {
      min-width: 110px;
      max-width: 160px;
      width: 100%;
      white-space: nowrap;
      flex: 1 1 110px;
    }
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    & > button {
      width: 100%;
      margin-right: 0;
      min-width: 0;
      white-space: normal;
    }
  }
`;
// src/components/cards/ItemCard.styles.js
import styled from "styled-components";

export const CardContainer = styled.article`
  background: var(--color-surface-raised);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
  @media (max-width: 600px) {
    padding: 0.75rem 0.25rem;
    gap: 0.5rem;
  }
`;

export const CardHeading = styled.h2`
  font-size: var(--text-md);
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
  font-weight: var(--font-semibold);
  word-break: break-word;
`;

export const CardButton = styled.button`
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
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  transition: background 0.2s;
  width: auto;
  @media (max-width: 600px) {
    width: 100%;
    margin-right: 0;
  }
  &:hover,
  &:focus {
    background: var(--color-primary-hover);
  }
  &:disabled {
    background: var(--color-border);
    color: var(--color-text-muted);
    cursor: not-allowed;
  }
`;

export const CardButtonDanger = styled(CardButton)`
  background: var(--color-danger);
  color: var(--color-text-on-primary);
  &:hover,
  &:focus {
    background: var(--color-danger-hover, #b3001b);
  }
`;

export const CardButtonSecondary = styled(CardButton)`
  background: var(--color-secondary);
  &:hover,
  &:focus {
    background: var(--color-secondary-hover);
  }
`;

export const CardButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: flex-end;
  justify-content: flex-start;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    & > button {
      width: 100%;
      margin-right: 0;
    }
  }
`;
