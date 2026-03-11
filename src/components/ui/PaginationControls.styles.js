import styled from "styled-components";

export const PaginationContainer = styled.article`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
  font-size: var(--text-base);
  margin: var(--space-2) 0;
  flex-wrap: nowrap;
  overflow-x: auto;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: var(--space-2);
    font-size: var(--text-sm);
    padding: var(--space-1) 0;
    flex-wrap: wrap;
    overflow-x: visible;
  }

  @media (min-width: 481px) and (max-width: 802px) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-2);
  }
`;

export const PaginationRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  width: 100%;
`;

export const PageButton = styled.button`
  min-width: 80px;
  min-height: 44px;
  padding: 0 var(--space-3);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-default);
  box-shadow: var(--shadow-xs);
  white-space: nowrap;
  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    background: var(--color-primary-hover);
  }
  &:disabled {
    background: var(--color-border);
    color: var(--color-text-muted);
    cursor: not-allowed;
  }
`;

export const PageInfo = styled.span`
  font-size: var(--text-base);
  color: var(--color-text);
  margin: 0 var(--space-1);
  @media (max-width: 480px) {
    margin: 0;
  }
`;

export const PageSelectLabel = styled.label`
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-right: var(--space-1);
  min-height: 0;
`;

export const PageSelect = styled.select`
  min-width: 60px;
  font-size: var(--text-base);
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  margin-right: var(--space-2);
  white-space: nowrap;
  &:focus {
    outline: 2px solid var(--color-primary);
  }
`;

export const RangeInfo = styled.span`
  font-size: var(--text-sm);
  color: var(--color-text-muted);
`;
