import { memo } from "react";
import { useLocation } from "react-router-dom";

// This is a simple placeholder page for routes that haven't been implemented yet
// It dynamically generates a title based on the current pathname
const generatePageTitle = (pathname) =>
  pathname
    .split("/") // Remove empty segments and replace dashes with spaces
    .filter(Boolean) // Remove empty segments
    .map((word) => word.replace(/-/g, " ")) // Replace dashes with spaces
    .join(" ") // Join words with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()) + " Page"; // Capitalize the first letter of each word

function ComingSoonPage() {
  const { pathname } = useLocation();
  return (
    <main>
      <h2>{generatePageTitle(pathname)}</h2>
      <p>Coming Soon....</p>
    </main>
  );
}

export default memo(ComingSoonPage);
