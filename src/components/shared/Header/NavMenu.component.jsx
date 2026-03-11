import { memo, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useInventoryData } from "../../../context/InventoryContext";

function NavMenu() {
  const { items } = useInventoryData();
  const archivedItemsExist = useMemo(
    () => items.some((item) => item.Status === "archived"),
    [items],
  );

  const ariaCurrent = ({ isActive }) => (isActive ? "page" : undefined);
  const navClass = ({ isActive }) => (isActive ? "active" : null);

  return (
    <nav aria-label="Primary navigation">
      <menu>
        <li>
          <NavLink
            to="/"
            className={navClass}
            aria-current={ariaCurrent}
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/about"
            className={navClass}
            aria-current={ariaCurrent}
          >
            About
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/settings"
            className={navClass}
            aria-current={ariaCurrent}
          >
            Settings
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/fridge"
            className={navClass}
            aria-current={ariaCurrent}
          >
            Fridge
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/freezer"
            className={navClass}
            aria-current={ariaCurrent}
          >
            Freezer
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/pantry"
            className={navClass}
            aria-current={ariaCurrent}
          >
            Pantry
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/shopping-list"
            className={navClass}
            aria-current={ariaCurrent}
          >
            Shopping List
          </NavLink>
        </li>

        {archivedItemsExist && (
          <li>
            <NavLink
              to="/archive"
              className={navClass}
              aria-current={ariaCurrent}
            >
              Archived Items
            </NavLink>
          </li>
        )}
      </menu>
    </nav>
  );
}

export default memo(NavMenu);
