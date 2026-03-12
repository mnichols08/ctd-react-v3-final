import { memo, useEffect } from "react";
import useToggle from "../hooks/useToggle";
import useTitle from "../hooks/useTitle";
import FieldSelector from "../components/cards/FieldSelector.component";
import DarkModeToggle from "../components/forms/DarkModeToggle.component";

function SettingsPage() {
  const [showFieldSelector, toggleFieldSelector, , closeFieldSelector] =
    useToggle(false);
  useTitle("Settings");
  return (
    <article>
      <h2>Settings</h2>
      <p>
        This is the settings page. Here you can customize your preferences and
        manage your account settings.
      </p>

      <button
        onClick={toggleFieldSelector}
        aria-label="Select visible fields"
        title="Select visible fields"
      >
        Edit Visible Fields
      </button>

      {showFieldSelector && <FieldSelector onClose={closeFieldSelector} />}
      <DarkModeToggle />
    </article>
  );
}

export default memo(SettingsPage);
