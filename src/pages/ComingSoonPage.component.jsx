import { memo, useEffect } from "react";
import { useLocation } from "react-router-dom";

// This is a simple placeholder page for routes that haven't been implemented yet
// It dynamically generates a title based on the current pathname
import generatePageTitle from "../utils/generatePageTitle";

function ComingSoonPage() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = `${generatePageTitle(pathname)} - Kitchen Inventory`;
  }, [pathname]);
  return (
    <article>
      <h2>{generatePageTitle(pathname)}</h2>
      <p>Coming Soon....</p>
    </article>
  );
}

export default memo(ComingSoonPage);
