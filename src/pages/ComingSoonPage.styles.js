import styled, { keyframes } from "styled-components";

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

export const ComingSoonContainer = styled.article`
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-2) var(--space-8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  text-align: center;
  @media (max-width: 480px) {
    min-height: 70vh;
    padding: var(--space-4) var(--space-1) var(--space-6);
    box-shadow: none;
    border-radius: var(--radius-md);
  }

  h2 {
    font-size: var(--text-2xl);
    color: var(--color-primary);
    margin-bottom: var(--space-4);
    font-weight: var(--font-bold);
    letter-spacing: 0.01em;
  }
  p {
    font-size: var(--text-lg);
    color: var(--color-text-muted);
    margin-bottom: var(--space-2);
    font-weight: var(--font-medium);
  }
`;

export const SoonIcon = styled.span`
  display: inline-block;
  font-size: 2.5rem;
  margin-bottom: var(--space-3);
  color: var(--color-primary);
  animation: ${bounce} 1.2s infinite;
  user-select: none;
`;

export const BackLink = styled.a`
  display: inline-block;
  margin-top: var(--space-4);
  color: var(--color-primary);
  font-weight: var(--font-semibold);
  text-decoration: underline;
  font-size: var(--text-base);
  transition: color 0.2s;
  &:hover {
    color: var(--color-primary-hover);
  }
`;
