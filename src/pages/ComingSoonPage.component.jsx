import { memo } from "react";
import { useLocation, Link } from "react-router-dom";
import useTitle from "../hooks/useTitle";
import { stripPageTitle } from "../utils/generatePageTitle";
import {
  ComingSoonContainer,
  SoonIcon,
  BackLink,
} from "./ComingSoonPage.styles";

function ComingSoonPage() {
  const { pathname } = useLocation();
  useTitle(pathname);
  return (
    <ComingSoonContainer>
      <SoonIcon aria-hidden="true" role="img">
        🚧
      </SoonIcon>
      <h2>{stripPageTitle(pathname)}</h2>
      <p>Coming Soon…</p>
      <BackLink as={Link} to="/">
        ← Back to Inventory
      </BackLink>
    </ComingSoonContainer>
  );
}

export default memo(ComingSoonPage);
