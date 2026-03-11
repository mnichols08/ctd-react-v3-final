// src/styles/GlobalStyles.js
import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

  /* =========================
     CSS Variables: Design Tokens
     ========================= */
  :root {
    --color-primary: #3a5a40;
    --color-primary-hover: #2d4732;
    --color-primary-subtle: #3a5a4015;
    --color-secondary: #457b9d;
    --color-secondary-hover: #365f7c;
    --color-secondary-subtle: #457b9d15;
    --color-success: #2d6a4f;
    --color-success-subtle: #2d6a4f15;
    --color-warning: #ffb703;
    --color-warning-subtle: #ffb70320;
    --color-danger: #d90429;
    --color-danger-subtle: #d9042915;
    --color-info: #457b9d;
    --color-info-subtle: #457b9d15;
    --color-neutral-100: #f9f9fb;
    --color-neutral-200: #ececf1;
    --color-neutral-300: #d9d9e3;
    --color-neutral-400: #bcbcd0;
    --color-neutral-500: #8d99ae;
    --color-neutral-600: #6c757d;
    --color-neutral-700: #495057;
    --color-neutral-800: #343a40;
    --color-neutral-900: #22223b;
    --color-surface: #ffffff;
    --color-surface-raised: #ffffff;
    --color-surface-overlay: #ffffff;
    --color-background: #f9f9fb;
    --color-border: var(--color-neutral-300);
    --color-border-strong: var(--color-neutral-400);
    --color-text: #22223b;
    --color-text-muted: #6c757d;
    --color-text-subtle: #8d99ae;
    --color-text-on-primary: #ffffff;
    --text-xs: clamp(0.64rem, 0.6rem + 0.2vw, 0.75rem);
    --text-sm: clamp(0.78rem, 0.75rem + 0.2vw, 0.875rem);
    --text-base: clamp(0.9rem, 0.875rem + 0.3vw, 1rem);
    --text-md: clamp(1rem, 0.95rem + 0.4vw, 1.125rem);
    --text-lg: clamp(1.1rem, 1rem + 0.6vw, 1.25rem);
    --text-xl: clamp(1.25rem, 1.1rem + 0.8vw, 1.5rem);
    --text-2xl: clamp(1.5rem, 1.3rem + 1vw, 1.875rem);
    --text-3xl: clamp(1.875rem, 1.5rem + 1.5vw, 2.25rem);
    --text-4xl: clamp(2.25rem, 1.8rem + 2vw, 3rem);
    --font-normal: 400;
    --font-medium: 500;
    --font-semibold: 600;
    --font-bold: 700;
    --leading-tight: 1.25;
    --leading-snug: 1.375;
    --leading-normal: 1.5;
    --leading-relaxed: 1.625;
    --leading-loose: 2;
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-5: 1.25rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    --space-10: 2.5rem;
    --space-12: 3rem;
    --space-16: 4rem;
    --space-20: 5rem;
    --space-24: 6rem;
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    --radius-2xl: 1.5rem;
    --radius-full: 9999px;
    --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
    --z-below: -1;
    --z-base: 0;
    --z-raised: 10;
    --z-dropdown: 100;
    --z-sticky: 200;
    --z-overlay: 300;
    --z-modal: 400;
    --z-toast: 500;
    --z-tooltip: 600;
    --duration-fast: 100ms;
    --duration-base: 200ms;
    --duration-slow: 300ms;
    --duration-slower: 500ms;
    --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
    --ease-in: cubic-bezier(0.4, 0, 1, 1);
    --ease-out: cubic-bezier(0, 0, 0.2, 1);
    --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
    --container-sm: 640px;
    --container-md: 768px;
    --container-lg: 1024px;
    --container-xl: 1280px;
    --container-2xl: 1536px;
  }

  [data-theme="light"] {
    --color-background: #f9f9fb;
    --color-surface: #ffffff;
    --color-surface-raised: #ffffff;
    --color-surface-overlay: #ffffff;
    --color-text: #22223b;
    --color-text-muted: #6c757d;
    --color-text-subtle: #8d99ae;
    --color-border: var(--color-neutral-300);
    --color-border-strong: var(--color-neutral-400);
    --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  }
  [data-theme="dark"] {
    --color-primary: #80b918;
    --color-primary-hover: #5a7d13;
    --color-primary-subtle: #80b91820;
    --color-secondary: #4ea8de;
    --color-secondary-hover: #277da1;
    --color-secondary-subtle: #4ea8de20;
    --color-success: #43aa8b;
    --color-success-subtle: #43aa8b20;
    --color-warning: #ffd166;
    --color-warning-subtle: #ffd16620;
    --color-danger: #ef233c;
    --color-danger-subtle: #ef233c20;
    --color-neutral-100: #232946;
    --color-neutral-200: #2d314d;
    --color-neutral-300: #393e5c;
    --color-neutral-400: #4f5370;
    --color-neutral-500: #6c6f8a;
    --color-neutral-600: #8d99ae;
    --color-neutral-700: #bcbcd0;
    --color-neutral-800: #ececf1;
    --color-neutral-900: #f9f9fb;
    --color-surface: #232946;
    --color-surface-raised: #2d314d;
    --color-surface-overlay: #393e5c;
    --color-background: #1a1a2e;
    --color-text: #f9f9fb;
    --color-text-muted: #bcbcd0;
    --color-text-subtle: #8d99ae;
    --color-border: var(--color-neutral-300);
    --color-border-strong: var(--color-neutral-400);
    --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.2);
    --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3);
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --color-primary: #80b918;
      --color-primary-hover: #5a7d13;
      --color-primary-subtle: #80b91820;
      --color-secondary: #4ea8de;
      --color-secondary-hover: #277da1;
      --color-secondary-subtle: #4ea8de20;
      --color-success: #43aa8b;
      --color-success-subtle: #43aa8b20;
      --color-warning: #ffd166;
      --color-warning-subtle: #ffd16620;
      --color-danger: #ef233c;
      --color-danger-subtle: #ef233c20;
      --color-neutral-100: #232946;
      --color-neutral-200: #2d314d;
      --color-neutral-300: #393e5c;
      --color-neutral-400: #4f5370;
      --color-neutral-500: #6c6f8a;
      --color-neutral-600: #8d99ae;
      --color-neutral-700: #bcbcd0;
      --color-neutral-800: #ececf1;
      --color-neutral-900: #f9f9fb;
      --color-surface: #232946;
      --color-surface-raised: #2d314d;
      --color-surface-overlay: #393e5c;
      --color-background: #1a1a2e;
      --color-text: #f9f9fb;
      --color-text-muted: #bcbcd0;
      --color-text-subtle: #8d99ae;
      --color-border: var(--color-neutral-300);
      --color-border-strong: var(--color-neutral-400);
      --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.2);
      --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3);
      --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3);
      --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3);
    }
  }

  html {
    box-sizing: border-box;
    font-size: 16px;
    -webkit-tap-highlight-color: transparent;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    scroll-behavior: smooth;
    overscroll-behavior-y: contain;
  }
  *, *:before, *:after {
    box-sizing: inherit;
    min-width: 0;
    overflow-wrap: break-word;
  }
  body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    min-height: 100dvh;
    font-family: 'Inter', 'Roboto', Arial, sans-serif;
    background: var(--color-background);
    color: var(--color-text);
    min-width: 320px;
    overflow-x: hidden;
    line-height: var(--leading-normal);
    font-size: var(--text-base);
    transition: background-color var(--duration-slow) var(--ease-default), color var(--duration-slow) var(--ease-default);
  }
  button, input, select, textarea, label, a {
    font-size: 1rem;
    min-width: 44px;
    min-height: 44px;
    line-height: 1.2;
    touch-action: manipulation;
    font-family: inherit;
    color: inherit;
  }
  h1, h2, h3, h4, h5, h6 {
    font-weight: var(--font-bold);
    margin: 0 0 0.5em 0;
    line-height: var(--leading-tight);
    text-wrap: balance;
  }
  p, li {
    text-wrap: pretty;
    max-width: 75ch;
  }
  ul[role="list"], ol[role="list"] {
    list-style: none;
    padding: 0;
  }
  a:not([class]) {
    color: var(--color-primary);
    text-decoration-skip-ink: auto;
    text-underline-offset: 0.2em;
    transition: color var(--duration-fast) var(--ease-default);
  }
  a:not([class]):hover {
    color: var(--color-primary-hover);
  }
  a:visited {
    color: var(--color-primary-hover);
  }
  img, picture, video, canvas, svg {
    display: block;
    max-width: 100%;
    height: auto;
  }
  #root, main, .App {
    width: 100vw;
    overflow-x: hidden;
  }
  /* Utility Classes */
  .visually-hidden {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }
  .skip-link {
    position: absolute;
    top: var(--space-2);
    left: var(--space-2);
    z-index: var(--z-toast);
    padding: var(--space-2) var(--space-4);
    background: var(--color-primary);
    color: var(--color-text-on-primary);
    border-radius: var(--radius-md);
    font-weight: var(--font-semibold);
    text-decoration: none;
    transform: translateY(-120%);
    transition: transform var(--duration-base) var(--ease-out);
  }
  .skip-link:focus {
    transform: translateY(0);
  }
  .container {
    width: 100%;
    max-width: var(--container-xl);
    margin-inline: auto;
    padding-inline: var(--space-4);
  }
  @media (min-width: 640px) {
    .container {
      padding-inline: var(--space-6);
    }
  }
  @media (min-width: 1024px) {
    .container {
      padding-inline: var(--space-8);
    }
  }
  .container-sm { max-width: var(--container-sm); }
  .container-md { max-width: var(--container-md); }
  .container-lg { max-width: var(--container-lg); }
  .container-2xl { max-width: var(--container-2xl); }
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .text-muted { color: var(--color-text-muted); }
  .text-subtle { color: var(--color-text-subtle); }
  .surface {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
  }
  .surface-raised {
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
  }

  /* Dialog/modal styles for theme support */
  dialog {
    background: var(--color-surface-overlay, var(--color-surface));
    color: var(--color-text);
    border: none;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    padding: 0;
    max-width: 96vw;
    width: auto;
    margin: auto;
    outline: none;
    transition: background var(--duration-slow) var(--ease-default), color var(--duration-slow) var(--ease-default);
    overflow-y: auto;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }
  dialog::backdrop {
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(2px);
  }
  dialog[open] {
    /* display/flex is now handled in dialog base styles */
  }
  @media (max-width: 600px) {
    dialog {
      max-width: 100vw;
      min-width: 0;
      border-radius: var(--radius-lg);
      padding: 0;
    }
  }

  /* Mobile breakpoints */
  @media (max-width: 480px) {
    html { font-size: 16px; }
    body { padding: 0; }
  }
`;

export default GlobalStyles;
