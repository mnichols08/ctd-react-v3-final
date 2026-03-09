import { memo, useMemo } from "react";
import { useInventoryContext } from "../../../context/InventoryContext";
import NavMenu from "./NavMenu.component";

function Header() {
  const inventory = useInventoryContext();
  const { items, visibleFields, toggleField, resetFields } = inventory;
  const archivedItemsExist = useMemo(
    () => items.some((item) => item.Status === "archived"),
    [items],
  );
  return (
    <header>
      <h1>Kitchen Inventory</h1>
      <p>Manage your kitchen items efficiently.</p>
      <NavMenu
        visibleFields={visibleFields}
        onToggleField={toggleField}
        onResetFields={resetFields}
        archivedItemsExist={archivedItemsExist}
      />
    </header>
  );
}

export default memo(Header);
