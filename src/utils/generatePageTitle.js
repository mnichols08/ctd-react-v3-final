// This is a simple placeholder page for routes that haven't been implemented yet
// It dynamically generates a title based on the current pathname
export const generatePageTitle = (pathname) =>
  pathname
    .split("/") // Remove empty segments and replace dashes with spaces
    .filter(Boolean) // Remove empty segments
    .map((word) => word.replace(/-/g, " ")) // Replace dashes with spaces
    .join(" ") // Join words with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()) + " Page"; // Capitalize the first letter of each word

export default generatePageTitle;
