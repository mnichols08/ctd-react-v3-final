import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// SECURITY NOTE:
// The VITE_AIRTABLE_PAT variable is exposed in the client-side bundle because
// Vite inlines all env vars prefixed with VITE_. This is acceptable only for
// learning/personal use with a low-privilege token. For any production use,
// do not put Airtable Personal Access Tokens (or other secrets) in VITE_ env
// vars. Instead, store them on a backend or serverless function and proxy API
// requests so the token never reaches the browser.

const REQUIRED_ENV_VARS = [
  "VITE_AIRTABLE_PAT",
  "VITE_AIRTABLE_BASE_ID",
  "VITE_AIRTABLE_TABLE_NAME",
];

REQUIRED_ENV_VARS.forEach((varName) => {
  if (!import.meta.env[varName]) {
    console.warn(
      `Missing environment variable: ${varName}. See .env.example for details.`,
    );
  }
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
