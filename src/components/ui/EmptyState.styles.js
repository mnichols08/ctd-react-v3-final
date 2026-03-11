import styled from "styled-components";

export const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-4);
  background: var(--color-surface-raised);
  color: var(--color-text-muted);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  margin: var(--space-4) auto;
  max-width: 480px;
  width: 100%;
  text-align: center;
  @media (max-width: 480px) {
    padding: var(--space-4) var(--space-2);
    max-width: 98vw;
  }
`;

export const EmptyMessage = styled.p`
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  color: var(--color-text-muted);
  margin: 0;
`;
