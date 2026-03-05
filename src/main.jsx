import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

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
