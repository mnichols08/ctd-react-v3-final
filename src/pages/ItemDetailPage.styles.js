import styled from "styled-components";
import { Link } from "react-router-dom";

export const DetailContainer = styled.article`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 60vh;
  gap: var(--space-4);
  padding: var(--space-8) var(--space-4);
  background: var(--color-surface-raised);
  color: var(--color-text);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  margin: var(--space-6) auto;
  max-width: 600px;
  width: 100%;
  text-align: center;
  @media (max-width: 600px) {
    padding: var(--space-4) var(--space-2);
    max-width: 98vw;
  }
`;

export const BreadcrumbNav = styled.nav`
  width: 100%;
  margin-bottom: var(--space-2);
  ol {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }
  li:not(:last-child)::after {
    content: "/";
    margin: 0 var(--space-1);
    color: var(--color-border-strong);
  }
`;

export const ItemHeader = styled.section`
  width: 100%;
  margin-bottom: var(--space-2);
  h2 {
    font-size: var(--text-2xl);
    color: var(--color-primary);
    font-weight: var(--font-bold);
    margin: 0 0 var(--space-1) 0;
  }
  p {
    font-size: var(--text-base);
    color: var(--color-text-muted);
    margin: 0;
  }
`;

export const ActionsNav = styled.nav`
  width: 100%;
  margin-bottom: var(--space-2);
  menu {
    display: flex;
    gap: var(--space-2);
    justify-content: center;
    list-style: none;
    padding: 0;
    margin: 0;
  }
  button {
    min-width: 90px;
    min-height: 44px;
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-base);
    font-weight: var(--font-semibold);
    border: none;
    border-radius: var(--radius-md);
    background: var(--color-primary);
    color: var(--color-text-on-primary);
    cursor: pointer;
    box-shadow: var(--shadow-xs);
    transition: background var(--duration-fast) var(--ease-default);
    &:hover,
    &:focus {
      background: var(--color-primary-hover);
    }
    &:last-child {
      background: var(--color-danger);
      &:hover,
      &:focus {
        background: var(--color-danger-hover, #b3001b);
      }
    }
  }
`;

export const FieldsSection = styled.section`
  width: 100%;
  margin-top: var(--space-2);
  h3 {
    font-size: var(--text-lg);
    color: var(--color-text);
    margin-bottom: var(--space-2);
  }
  dl {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 0;
    background: var(--color-surface);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    box-shadow: var(--shadow-xs);
    font-size: var(--text-base);
    @media (max-width: 600px) {
      grid-template-columns: 1fr;
      padding: var(--space-2);
    }
  }
  div {
    display: contents;
  }
  dt,
  dd {
    padding: var(--space-2) var(--space-2);
    border-bottom: 1px solid var(--color-border);
    background: none;
    word-break: break-word;
    @media (max-width: 600px) {
      padding: var(--space-2) 0;
    }
  }
  dt {
    font-weight: var(--font-bold);
    color: var(--color-text-muted);
    text-align: left;
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    @media (max-width: 600px) {
      border-right: none;
      border-bottom: none;
      background: var(--color-surface);
    }
  }
  dd {
    color: var(--color-text);
    text-align: right;
    background: var(--color-surface);
    font-weight: 400;
    @media (max-width: 600px) {
      text-align: left;
      border-bottom: 1px solid var(--color-border);
    }
  }
  dl > div:nth-child(even) dt,
  dl > div:nth-child(even) dd {
    background: var(--color-neutral-100);
  }
`;

export const StyledLink = styled(Link)`
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 0.15em;
  transition: color var(--duration-fast) var(--ease-default);
  &:hover,
  &:focus {
    color: var(--color-primary-hover);
  }
`;
