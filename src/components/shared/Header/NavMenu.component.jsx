import { memo, useMemo } from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { useInventoryData } from "../../../context/InventoryContext";

const DesktopNav = styled.nav`
  display: none;
  @media (min-width: 769px) {
    display: block;
  }
`;

const Menu = styled.ul`
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const MenuItem = styled.li``;

const StyledNavLink = styled(NavLink)`
  font-size: 1rem;
  color: #222;
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition:
    background 0.2s,
    color 0.2s;
  &.active,
  &:hover {
    background: #f0f0f0;
    color: #0077cc;
  }
`;

function NavMenu() {
  const { items } = useInventoryData();
  const archivedItemsExist = useMemo(
    () => items.some((item) => item.Status === "archived"),
    [items],
  );
  return (
    <DesktopNav aria-label="Primary navigation">
      <Menu>
        <MenuItem>
          <StyledNavLink to="/">Dashboard</StyledNavLink>
        </MenuItem>
        <MenuItem>
          <StyledNavLink to="/about">About</StyledNavLink>
        </MenuItem>
        <MenuItem>
          <StyledNavLink to="/settings">Settings</StyledNavLink>
        </MenuItem>
        <MenuItem>
          <StyledNavLink to="/fridge">Fridge</StyledNavLink>
        </MenuItem>
        <MenuItem>
          <StyledNavLink to="/freezer">Freezer</StyledNavLink>
        </MenuItem>
        <MenuItem>
          <StyledNavLink to="/pantry">Pantry</StyledNavLink>
        </MenuItem>
        <MenuItem>
          <StyledNavLink to="/shopping-list">Shopping List</StyledNavLink>
        </MenuItem>
        {archivedItemsExist && (
          <MenuItem>
            <StyledNavLink to="/archive">Archived Items</StyledNavLink>
          </MenuItem>
        )}
      </Menu>
    </DesktopNav>
  );
}

export default memo(NavMenu);
