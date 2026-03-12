import styled from "styled-components";

export const AboutContainer = styled.article`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-2) var(--space-12);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  @media (max-width: 600px) {
    padding: var(--space-4) var(--space-1) var(--space-8);
    gap: var(--space-6);
  }
`;

export const Hero = styled.header`
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-8) var(--space-4) var(--space-6);
  margin-bottom: var(--space-4);
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  @media (max-width: 600px) {
    padding: var(--space-6) var(--space-2) var(--space-4);
  }
  [data-theme="dark"] & {
    background: var(--color-surface);
    color: var(--color-text);
  }
`;

export const HeroTitle = styled.h1`
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--space-2);
  letter-spacing: 0.01em;
`;

export const HeroAccent = styled.span`
  color: var(--color-secondary);
  font-style: italic;
  [data-theme="dark"] & {
    color: var(--color-warning);
  }
`;

export const HeroMeta = styled.div`
  display: flex;
  gap: var(--space-2);
  justify-content: center;
  margin-top: var(--space-2);
  flex-wrap: wrap;
`;

export const MetaBadge = styled.span`
  background: var(--color-primary-subtle);
  color: var(--color-text-on-primary);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  padding: 0.25em 0.75em;
  font-weight: var(--font-semibold);
  letter-spacing: 0.04em;
  [data-theme="dark"] & {
    background: var(--color-secondary);
    color: var(--color-surface);
    text-shadow: 0 1px 2px var(--color-neutral-900);
  }
`;

export const Section = styled.section`
  margin-bottom: var(--space-6);
`;

export const SectionLabel = styled.div`
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: var(--space-2);
  font-weight: var(--font-semibold);
`;

export const SectionTitle = styled.h2`
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--space-3);
`;

export const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
  align-items: start;
  @media (max-width: 800px) {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
`;

export const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

export const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-md);
  color: var(--color-text);
  line-height: 1.6;
`;

export const FeatureDot = styled.span`
  width: 0.85em;
  height: 0.85em;
  border-radius: 50%;
  background: var(--color-secondary);
  display: inline-block;
  flex-shrink: 0;
  [data-theme="dark"] & {
    background: var(--color-warning);
  }
`;

export const StackGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-3);
`;

export const StackCard = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-2);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25em;
`;

export const StackLabel = styled.span`
  font-weight: var(--font-bold);
  font-size: var(--text-base);
`;

export const StackSub = styled.span`
  font-size: var(--text-xs);
  color: var(--color-text-muted);
`;

export const MilestoneGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-3);
`;

export const MilestoneCard = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4) var(--space-3);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-xs);
  }
`;

export const MilestoneTitle = styled.h3`
  font-size: var(--text-md);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-2);
`;

export const MilestoneDesc = styled.p`
  font-size: var(--text-sm);
  color: var(--color-text-muted);
`;

export const Acknowledgment = styled.section`
  text-align: center;
  margin: var(--space-6) 0 var(--space-2);
`;

export const AckText = styled.p`
  font-size: var(--text-base);
  color: var(--color-text);
  margin-bottom: var(--space-2);
`;

export const AckLink = styled.a`
  color: var(--color-primary);
  font-weight: var(--font-semibold);
  text-decoration: underline;
  font-size: var(--text-md);
  text-underline-offset: 2px;
  &:hover {
    color: var(--color-primary-hover);
  }
  [data-theme="dark"] & {
    color: var(--color-warning);
    text-shadow: 0 1px 2px var(--color-surface);
  }
`;

export const Footer = styled.footer`
  margin-top: var(--space-8);
  padding: var(--space-4) 0 0;
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  display: flex;
  gap: var(--space-2);
  justify-content: center;
  align-items: center;
`;

export const FooterDot = styled.span`
  color: var(--color-border);
`;

export const FooterLink = styled.a`
  color: var(--color-text-muted);
  text-decoration: underline;
  text-underline-offset: 2px;
  &:hover {
    color: var(--color-primary);
  }
  [data-theme="dark"] & {
    color: var(--color-warning);
    text-shadow: 0 1px 2px var(--color-surface);
  }
`;
