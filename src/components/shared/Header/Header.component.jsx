import { memo } from "react";
import NavMenu from "./NavMenu.component";

function Header({
  visibleFields,
  onToggleField,
  onResetFields,
  archivedItemsExist,
}) {
  return (
    <header>
      <h1>Kitchen Inventory</h1>
      <p>Manage your kitchen items efficiently.</p>
      <NavMenu
        visibleFields={visibleFields}
        onToggleField={onToggleField}
        onResetFields={onResetFields}
        archivedItemsExist={archivedItemsExist}
      />
    </header>
  );
}

export default memo(Header);
