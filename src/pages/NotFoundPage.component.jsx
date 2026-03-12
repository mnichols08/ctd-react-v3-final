import { memo, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useTitle from "../hooks/useTitle";
import {
  NotFoundContainer,
  NotFoundHeading,
  NotFoundMessage,
  NotFoundCode,
  NotFoundHomeLink,
} from "./NotFoundPage.styles";

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

  useTitle("404 Not Found");

  return (
    <NotFoundContainer role="status" aria-live="polite">
      <NotFoundHeading>404 Not Found</NotFoundHeading>
      <NotFoundMessage>
        {randomMessage} <NotFoundCode>{location.pathname}</NotFoundCode> does not exist just yet.
      </NotFoundMessage>
      <NotFoundHomeLink to="/" aria-label="Go to home page">
        Go Home
      </NotFoundHomeLink>
    </NotFoundContainer>
  );
}

export default memo(NotFoundPage);
