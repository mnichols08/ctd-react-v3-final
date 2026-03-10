import { useEffect } from "react";

function AboutPage() {
    const version = `v${__APP_VERSION__}`
    useEffect(() => {document.title = "About - Kitchen Inventory"}, [])
  return (
    <main>
      <section>
        <p>Code The Dream · Lark Cohort · Final Exam - {version}</p>
        <h1>About Page</h1>
        <p>
          A fully-featured inventory and meal-planning app built on React
          fundamentals — emphasizing code quality, reliability, accessibility,
          and a robust test suite.
        </p>

        <div>
          <span>React + JavaScript</span>
          <span>Airtable Backend</span>
          <span>LocalStorage Fallback</span>
        </div>
      </section>

      <section>
        <div>01 — Overview</div>
        <div>
          <div>
            <h2>What This App Does</h2>
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
          <ul>
            <li>
              <span />
              Inventory management — add, edit, archive, delete
            </li>
            <li>
              <span />
              Location tracking across pantry, fridge & freezer
            </li>
            <li>
              <span />
              Integrated shopping list with smart restock logic
            </li>
            <li>
              <span />
              Advanced filtering by category, location & expiration
            </li>
            <li>
              <span />
              Dynamic sorting, pagination & field visibility controls
            </li>
            <li>
              <span />
              Responsive, accessible modal dialogs
            </li>
            <li>
              <span />
              Airtable backend with local fallback
            </li>
            <li>
              <span />
              250+ unit & integration tests
            </li>
          </ul>
        </div>
      </section>

      <section>
        <div>02 — Stack</div>
        <h2>Built With</h2>
        <div>
          <div>
            <span>React</span>
            <span>JavaScript</span>
          </div>
          <div>
            <span>Vitest</span>
            <span>Testing</span>
          </div>
          <div>
            <span>Airtable</span>
            <span>Backend</span>
          </div>
          <div>
            <span>React Router</span>
            <span>Navigation</span>
          </div>
          <div>
            <span>Custom Hooks</span>
            <span>State</span>
          </div>
          <div>
            <span>ARIA</span>
            <span>Accessibility</span>
          </div>
        </div>
      </section>

      <section>
        <div>03 — Evolution</div>
        <h2>Key Milestones</h2>
        <div>
          <div>
            <h3>Context & Reducers</h3>
            <p>
              Evolved from prop-driven components into a modular architecture
              using React Context and reducers for all state — inventory, UI,
              and actions — eliminating prop drilling and reducing unnecessary
              renders.
            </p>
          </div>
          <div>
            <h3>Routing & Navigation</h3>
            <p>
              Introduced react-router-dom for a flexible multi-page app with
              dashboard, settings, error pages, and coming-soon placeholders.
              Navigation links and page titles are dynamic and fully accessible.
            </p>
          </div>
          <div>
            <h3>Airtable Integration</h3>
            <p>
              Inventory is stored in Airtable and fetched via a serverless proxy
              function, keeping private tokens off the frontend. The app
              gracefully falls back to sample data or local storage for offline
              and dev scenarios.
            </p>
          </div>
          <div>
            <h3>Advanced UI Features</h3>
            <p>
              Rich search, filter, and sort across any field. Collapsible
              sections by location, editable overlays using native
              &lt;dialog&gt;, multi-page and partial-load state handling, and
              bulk shopping list updates.
            </p>
          </div>
          <div>
            <h3>Accessibility & Testing</h3>
            <p>
              Fully accessible forms with clear labeling, modal trapping, focus
              handling, and keyboard support. 250+ unit and integration tests
              covering error paths, reducer logic, async flows, and
              accessibility checks.
            </p>
          </div>
          <div>
            <h3>Resilience & Quality</h3>
            <p>
              Strict error handling for all data mutations with optimistic UI
              and rollback on failure. Throttling and deduplication logic for
              API calls, plus version-aware updates to prevent stale async
              writes.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div>04 — Learnings</div>
        <h2>Areas of Growth</h2>
        <div>
          <div>
            <h3>Custom Hooks & Context</h3>
            <p>
              Implemented and refined scalable patterns for app-wide state,
              moving from prop drilling to clean, composable hook-driven
              architecture.
            </p>
          </div>
          <div>
            <h3>Test-Driven Development</h3>
            <p>
              Practiced TDD throughout, expanding coverage to error paths, edge
              cases, async flows, and accessibility assertions.
            </p>
          </div>
          <div>
            <h3>Backend Integration</h3>
            <p>
              Worked with real APIs, handled auth and secrets securely, and
              optimized fetch logic for pagination, throttling, and error
              handling.
            </p>
          </div>
          <div>
            <h3>Accessibility & Responsiveness</h3>
            <p>
              Paid close attention to ARIA roles, modal semantics, keyboard
              navigation, and mobile-first responsive design.
            </p>
          </div>
          <div>
            <h3>Error Resilience</h3>
            <p>
              Architected UI and hooks for graceful degradation — optimistic
              updates with rollback, detailed error states, and version-aware
              writes.
            </p>
          </div>
        </div>
      </section>
      <section>
        <p>
          This project reflects <strong>Code The Dream's</strong> emphasis on
          real-world code quality, modern testing, and thoughtful user-centric
          design. Thanks to the Lark cohort for feedback and support throughout.
        </p>
        <a
          href="https://www.codethedream.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          codethedream.org →
        </a>
      </section>
    </main>
  );
}

export default AboutPage;