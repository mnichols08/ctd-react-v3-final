import styled from "styled-components";

export const FooterContainer = styled.footer`
  width: 100%;
  background: var(--color-surface);
  color: var(--color-text-muted);
  border-top: 1px solid var(--color-border);
  padding: var(--space-4) 0 var(--space-2) 0;
  margin-top: auto;
  font-size: var(--text-sm);
  box-shadow: 0 -2px 8px 0 rgb(0 0 0 / 0.03);
  z-index: var(--z-base);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 90px;
  @media (max-width: 480px) {
    font-size: var(--text-xs);
    padding: var(--space-3) 0 var(--space-1) 0;
  }
`;

export const FooterText = styled.p`
  margin: 0 0 var(--space-1) 0;
  color: var(--color-text-muted);
`;

export const FooterLink = styled.a`
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 0.15em;
  transition: color var(--duration-fast) var(--ease-default);
  &:hover,
  &:focus {
    color: var(--color-primary-hover);
  }
`;
