import { memo, useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

function NotFoundPage() {
  const location = useLocation();
  const friendlyErrorMessages = [
    "Oops! It looks like the page you're trying to access doesn't exist.",
    "The page you are looking for cannot be found.",
    "You seem to have found a page we aren't ready to show yet.",
    "Sorry, we couldn't find that page.",
    "The page you requested is not available.",
  ];
  const [randomMessage] = useState(
    () =>
      friendlyErrorMessages[
        Math.floor(Math.random() * friendlyErrorMessages.length)
      ],
  );

  useEffect(() => {
    document.title = "404 Not Found - Kitchen Inventory";
  }, []);

  return (
    <main>
      <h2>404 Not Found</h2>
      <p>
        {randomMessage} <code>{location.pathname}</code> does not exist just
        yet. 
      </p>
      <h3>
        <Link to="/" aria-label="Go to home page">
          Go Home
        </Link>
      </h3>
    </main>
  );
}

export default memo(NotFoundPage);
