import { memo, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useInventoryData } from "../../../context/InventoryContext";

function NavMenu() {
  const { items } = useInventoryData();
  const archivedItemsExist = useMemo(
    () => items.some((item) => item.Status === "archived"),
    [items],
  );

  const navClass = ({ isActive }) => (isActive ? "active" : null);

  return (
    <nav aria-label="Primary">
      <menu>
        <li>
          <NavLink to="/" className={navClass}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className={navClass}>
            About
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings" className={navClass}>
            Settings
          </NavLink>
        </li>
        <li>
          <NavLink to="/fridge" className={navClass}>
            Fridge
          </NavLink>
        </li>
        <li>
          <NavLink to="/freezer" className={navClass}>
            Freezer
          </NavLink>
        </li>
        <li>
          <NavLink to="/pantry" className={navClass}>
            Pantry
          </NavLink>
        </li>
        <li>
          <NavLink to="/shopping-list" className={navClass}>
            Shopping List
          </NavLink>
        </li>

        {archivedItemsExist && (
          <li>
            <NavLink to="/archive" className={navClass}>
              Archived Items
            </NavLink>
          </li>
        )}
      </menu>
    </nav>
  );
}

export default memo(NavMenu);
