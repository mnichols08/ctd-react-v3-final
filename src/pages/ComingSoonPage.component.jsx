import { memo, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import generatePageTitle from "../utils/generatePageTitle";
import {
  ComingSoonContainer,
  SoonIcon,
  BackLink,
} from "./ComingSoonPage.styles";

function ComingSoonPage() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = `${generatePageTitle(pathname)} - Kitchen Inventory`;
  }, [pathname]);
  return (
    <ComingSoonContainer>
      <SoonIcon aria-hidden="true" role="img">
        🚧
      </SoonIcon>
      <h2>{generatePageTitle(pathname)}</h2>
      <p>Coming Soon…</p>
      <BackLink as={Link} to="/">
        ← Back to Inventory
      </BackLink>
    </ComingSoonContainer>
  );
}

export default memo(ComingSoonPage);
