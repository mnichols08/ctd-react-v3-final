import { Link } from "react-router-dom";
import styled from "styled-components";

export const NotFoundContainer = styled.article`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: var(--space-4);
  padding: var(--space-8) var(--space-4);
  background: var(--color-surface-raised);
  color: var(--color-text);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  margin: var(--space-6) auto;
  max-width: 540px;
  width: 100%;
  text-align: center;
  @media (max-width: 480px) {
    padding: var(--space-4) var(--space-2);
    max-width: 98vw;
  }
`;

export const NotFoundHeading = styled.h2`
  font-size: var(--text-3xl);
  color: var(--color-danger);
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-2) 0;
`;

export const NotFoundMessage = styled.p`
  font-size: var(--text-lg);
  color: var(--color-text);
  margin: 0 0 var(--space-2) 0;
`;

export const NotFoundCode = styled.code`
  color: var(--color-primary);
  background: var(--color-primary-subtle);
  border-radius: var(--radius-sm);
  padding: 0.1em 0.4em;
  font-size: var(--text-base);
`;

export const NotFoundHomeLink = styled(Link)`
  color: var(--color-primary);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  text-decoration: underline;
  text-underline-offset: 0.15em;
  transition: color var(--duration-fast) var(--ease-default);
  &:hover,
  &:focus {
    color: var(--color-primary-hover);
  }
`;
