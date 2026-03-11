// src/pages/IndexPage.styles.js
import styled from "styled-components";

export const DashboardArticle = styled.article`
  width: 100vw;
  max-width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 0.5rem 0.5rem 2.5rem 0.5rem;
  background: var(--color-background);
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  @media (min-width: 481px) {
    padding: 1.5rem 2vw 3rem 2vw;
    gap: 2rem;
  }
`;

export const DashboardTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0.5rem 0 0.5rem 0;
  letter-spacing: 0.01em;
  @media (min-width: 481px) {
    font-size: 2rem;
    margin: 1rem 0 1.5rem 0;
  }
`;

export const SectionAlert = styled.div`
  background: var(--color-warning-subtle, #fffbe6);
  color: var(--color-warning, #856404);
  border: 1px solid var(--color-warning, #ffeeba);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: 1rem;
`;
