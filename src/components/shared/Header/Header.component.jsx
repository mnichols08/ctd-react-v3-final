import { memo } from "react";
import NavMenu from "./NavMenu.component";

function Header() {
  return (
    <header aria-label="Site header">
      <p>Kitchen Inventory</p>
      <p>Manage your kitchen items efficiently.</p>
      <NavMenu />
    </header>
  );
}

export default memo(Header);
