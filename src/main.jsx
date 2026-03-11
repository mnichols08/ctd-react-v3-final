import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { InventoryProvider } from "./context/InventoryProvider";

// SECURITY NOTE:
// When VITE_AIRTABLE_PAT is set (local dev), API calls go directly to Airtable
// and the token is exposed in the client bundle — acceptable only for personal
// use with a low-privilege token.
//
// When VITE_AIRTABLE_PAT is absent (production on Netlify), API calls route
// through the Netlify serverless proxy at /.netlify/functions/airtable, and the
// PAT is stored in Netlify environment variables — never shipped to the browser.

// In direct mode, all three Airtable vars are required.
// In proxy mode, only VITE_SAMPLE_DATA needs to be absent (or "false").
const USE_PROXY = !import.meta.env.VITE_AIRTABLE_PAT;

if (!USE_PROXY) {
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
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <InventoryProvider>
      <App />
    </InventoryProvider>
  </StrictMode>,
);
