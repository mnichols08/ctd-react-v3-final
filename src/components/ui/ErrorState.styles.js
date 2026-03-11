import styled from "styled-components";

export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-4);
  background: var(--color-danger-subtle);
  color: var(--color-danger);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin: var(--space-4) auto;
  max-width: 480px;
  width: 100%;
  text-align: center;
  @media (max-width: 480px) {
    padding: var(--space-4) var(--space-2);
    max-width: 98vw;
  }
`;

export const ErrorMessage = styled.p`
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-danger);
  margin: 0 0 var(--space-2) 0;
`;

export const ErrorDetails = styled.p`
  font-size: var(--text-sm);
  color: var(--color-text);
  margin: 0 0 var(--space-2) 0;
`;

export const ErrorButton = styled.button`
  min-width: 120px;
  min-height: 44px;
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-danger);
  color: var(--color-text-on-primary);
  cursor: pointer;
  margin: var(--space-1) 0;
  box-shadow: var(--shadow-xs);
  transition: background var(--duration-fast) var(--ease-default);
  &:hover,
  &:focus {
    background: var(--color-danger-hover, #b3001b);
  }
`;
