// src/components/ui/QuickStatsBar.styles.js
import styled from "styled-components";

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin: 0.5rem 0 0.5rem 0;
  @media (min-width: 376px) {
    gap: 1rem;
  }
  @media (min-width: 429px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
  }
  @media (orientation: landscape) and (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
`;

export const StatCard = styled.div`
  background: var(--color-surface-raised);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  padding: 0.75rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
`;

export const StatTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25em 0;
  color: var(--color-text);
`;

export const StatValue = styled.p`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-primary);
`;

export const StatsInfo = styled.p`
  font-size: 0.95rem;
  color: var(--color-text-muted);
  margin: 0.5rem 0 0 0;
  text-align: center;
`;
