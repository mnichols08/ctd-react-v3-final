import { useEffect, useState } from "react";

// Helper to get the current system theme (dark or light)
const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

// Applies the selected theme to the <html> element
const applyTheme = (theme) => {
  if (theme === "system") {
    // If "system", resolve to the actual system theme
    theme = getSystemTheme();
  }
  document.documentElement.setAttribute("data-theme", theme);
};

const DarkModeToggle = () => {
  // Initialize theme from localStorage or default to "system"
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });

  useEffect(() => {
    // Apply theme and persist selection to localStorage whenever theme changes
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    // If theme is "system", listen for OS-level theme changes
    if (theme === "system") {
      const handler = () => {
        applyTheme("system");
      };
      // Listen for changes in the system color scheme
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", handler);
      // Cleanup listener on unmount or theme change
      return () =>
        window
          .matchMedia("(prefers-color-scheme: dark)")
          .removeEventListener("change", handler);
    }
  }, [theme]);

  return (
    <fieldset>
      <legend>Theme</legend>
      <div role="radiogroup" aria-label="Theme selection">
        <label>
          <input
            type="radio"
            name="theme"
            value="light"
            checked={theme === "light"}
            onChange={() => setTheme("light")}
            aria-checked={theme === "light"}
            aria-label="Light theme"
          />
          Light
        </label>
        <label>
          <input
            type="radio"
            name="theme"
            value="dark"
            checked={theme === "dark"}
            onChange={() => setTheme("dark")}
            aria-checked={theme === "dark"}
            aria-label="Dark theme"
          />
          Dark
        </label>
        <label>
          <input
            type="radio"
            name="theme"
            value="system"
            checked={theme === "system"}
            onChange={() => setTheme("system")}
            aria-checked={theme === "system"}
            aria-label="System theme"
          />
          System
        </label>
      </div>
    </fieldset>
  );
};

export default DarkModeToggle;
