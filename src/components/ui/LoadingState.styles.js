import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-4);
  background: var(--color-surface-raised);
  color: var(--color-primary);
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

export const LoadingMessage = styled.p`
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  color: var(--color-primary);
  margin: 0;
`;

export const Spinner = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border: 4px solid var(--color-primary-subtle);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: var(--space-2);
`;
