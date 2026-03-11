import { memo, useEffect } from "react";
import useToggle from "../hooks/useToggle";
import FieldSelector from "../components/cards/FieldSelector.component";

function SettingsPage() {
  const [showFieldSelector, toggleFieldSelector, , closeFieldSelector] =
    useToggle(false);
  useEffect(() => {
    document.title = "Settings Page - Kitchen Inventory";
  }, [])
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
    </article>
  );
}

export default memo(SettingsPage);
