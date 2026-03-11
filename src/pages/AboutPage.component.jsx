import {
  AboutContainer,
  Hero,
  HeroTitle,
  HeroAccent,
  HeroMeta,
  MetaBadge,
  Section,
  SectionLabel,
  SectionTitle,
  OverviewGrid,
  FeatureList,
  FeatureItem,
  FeatureDot,
  StackGrid,
  StackCard,
  StackLabel,
  StackSub,
  MilestoneGrid,
  MilestoneCard,
  MilestoneTitle,
  MilestoneDesc,
  Acknowledgment,
  AckText,
  AckLink,
  Footer,
  FooterDot,
  FooterLink,
} from "./AboutPage.styles";
import { useEffect, useState } from "react";

const features = [
  "Inventory management — add, edit, archive, delete",
  "Location tracking across pantry, fridge & freezer",
  "Integrated shopping list with smart restock logic",
  "Advanced filtering by category, location & expiration",
  "Dynamic sorting, pagination & field visibility controls",
  "Responsive, accessible modal dialogs",
  "Airtable backend with local fallback",
];

const techStack = [
  { label: "React", sublabel: "JavaScript" },
  { label: "Airtable", sublabel: "Backend" },
  { label: "React Router", sublabel: "Navigation" },
  { label: "Custom Hooks", sublabel: "State" },
  { label: "ARIA", sublabel: "Accessibility" },
];

const milestones = [
  {
    title: "Context & Reducers",
    description:
      "Evolved from prop-driven components into a modular architecture using React Context and reducers for all state — inventory, UI, and actions — eliminating prop drilling and reducing unnecessary renders.",
  },
  {
    title: "Routing & Navigation",
    description:
      "Introduced react-router-dom for a flexible multi-page app with dashboard, settings, error pages, and coming-soon placeholders. Navigation links and page titles are dynamic and fully accessible.",
  },
  {
    title: "Airtable Integration",
    description:
      "Inventory is stored in Airtable and fetched via a serverless proxy function, keeping private tokens off the frontend. The app gracefully falls back to sample data or local storage for offline and dev scenarios.",
  },
  {
    title: "Advanced UI Features",
    description:
      "Rich search, filter, and sort across any field. Collapsible sections by location, editable overlays using native <dialog>, multi-page and partial-load state handling, and bulk shopping list updates.",
  },
  {
    title: "Accessibility",
    description:
      "Fully accessible forms with clear labeling, modal trapping, focus handling, and keyboard support.",
  },
  {
    title: "Resilience & Quality",
    description:
      "Strict error handling for all data mutations with optimistic UI and rollback on failure. Throttling and deduplication logic for API calls, plus version-aware updates to prevent stale async writes.",
  },
];

const learnings = [
  {
    heading: "Custom Hooks & Context",
    text: "Implemented and refined scalable patterns for app-wide state, moving from prop drilling to clean, composable hook-driven architecture.",
  },
  {
    heading: "Backend Integration",
    text: "Worked with real APIs, handled auth and secrets securely, and optimized fetch logic for pagination, throttling, and error handling.",
  },
  {
    heading: "Accessibility & Responsiveness",
    text: "Paid close attention to ARIA roles, modal semantics, keyboard navigation, and mobile-first responsive design.",
  },
  {
    heading: "Error Resilience",
    text: "Architected UI and hooks for graceful degradation — optimistic updates with rollback, detailed error states, and version-aware writes.",
  },
];

function AboutPage() {
  const [lastUpdated, setLastUpdated] = useState(null);

  const formattedLastUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Loading...";
  useEffect(() => {
    document.title = "About - Kitchen Inventory";
    fetch("https://api.github.com/repos/mnichols08/ctd-react-v3-final")
      .then((res) => res.json())
      .then((data) => setLastUpdated(data.pushed_at));
  }, []);
  return (
    <AboutContainer>
      <Hero>
        <p>Code The Dream · Lark Cohort · Final Exam</p>
        <HeroTitle>
          Kitchen <br />
          <HeroAccent>Inventory</HeroAccent>
        </HeroTitle>
        <p>
          A fully-featured inventory and meal-planning app built on React
          fundamentals — emphasizing code quality, reliability, accessibility,
          and a robust test suite.
        </p>
        <HeroMeta>
          <MetaBadge>React + JavaScript</MetaBadge>
          <MetaBadge>Airtable Backend</MetaBadge>
        </HeroMeta>
      </Hero>

      <Section>
        <SectionLabel>01 — Overview</SectionLabel>
        <OverviewGrid>
          <div>
            <SectionTitle>What This App Does</SectionTitle>
            <p>
              Users can track kitchen items across multiple storage locations —
              pantry, fridge, and freezer — manage shopping lists intelligently,
              and reduce food waste through thoughtful meal planning. The app is
              built for real-world use, not just demonstration.
            </p>
            <p>
              The architecture prioritizes a single source of truth: a
              reducer-based state model shared via React Context, making every
              part of the UI predictably consistent and easy to test.
            </p>
          </div>
          <FeatureList>
            {features.map((f, i) => (
              <FeatureItem key={i}>
                <FeatureDot />
                {f}
              </FeatureItem>
            ))}
          </FeatureList>
        </OverviewGrid>
      </Section>

      <Section>
        <SectionLabel>02 — Stack</SectionLabel>
        <SectionTitle>Built With</SectionTitle>
        <StackGrid>
          {techStack.map((t) => (
            <StackCard key={t.label}>
              <StackLabel>{t.label}</StackLabel>
              <StackSub>{t.sublabel}</StackSub>
            </StackCard>
          ))}
        </StackGrid>
      </Section>

      <Section>
        <SectionLabel>03 — Evolution</SectionLabel>
        <SectionTitle>Key Milestones</SectionTitle>
        <MilestoneGrid>
          {milestones.map((m, i) => (
            <MilestoneCard key={i}>
              <MilestoneTitle>{m.title}</MilestoneTitle>
              <MilestoneDesc>{m.description}</MilestoneDesc>
            </MilestoneCard>
          ))}
        </MilestoneGrid>
      </Section>

      <Section>
        <SectionLabel>04 — Learnings</SectionLabel>
        <SectionTitle>Areas of Growth</SectionTitle>
        <MilestoneGrid>
          {learnings.map((l, i) => (
            <MilestoneCard key={i}>
              <MilestoneTitle>{l.heading}</MilestoneTitle>
              <MilestoneDesc>{l.text}</MilestoneDesc>
            </MilestoneCard>
          ))}
        </MilestoneGrid>
      </Section>

      <Acknowledgment>
        <AckText>
          This project reflects <strong>Code The Dream&apos;s</strong> emphasis
          on real-world code quality and thoughtful user-centric design. Thanks
          to the Lark cohort for feedback and support throughout.
        </AckText>
        <AckLink
          href="https://www.codethedream.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          codethedream.org →
        </AckLink>
      </Acknowledgment>

      <Footer>
        <span>Last updated: {formattedLastUpdated}</span>
        <FooterDot>·</FooterDot>
        <FooterLink href="./CHANGELOG.md" target="_blank">
          View Changelog
        </FooterLink>
      </Footer>
    </AboutContainer>
  );
}

export default AboutPage;
