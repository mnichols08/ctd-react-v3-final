// src/components/shared/Header/MobileNavMenu.component.jsx
import { useState } from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { useInventoryData } from "../../../context/InventoryContext";

const Hamburger = styled.button`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 1001;
  @media (min-width: 769px) {
    display: none;
  }
`;

const Bar = styled.span`
  width: 22px;
  height: 3px;
  background: var(--color-text);
  margin: 2px 0;
  border-radius: 2px;
  transition: 0.3s;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: ${({ open }) => (open ? "block" : "none")};
`;

const Drawer = styled.nav`
  position: fixed;
  top: 0;
  right: 0;
  width: 80vw;
  max-width: 320px;
  height: 100vh;
  background: var(--color-surface);
  box-shadow: -2px 0 8px var(--color-border-strong, rgba(0,0,0,0.08));
  z-index: 1001;
  transform: ${({ open }) => (open ? "translateX(0)" : "translateX(100%)")};
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 1.25rem 1rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  @media (min-width: 769px) {
    display: none;
  }
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const MenuItem = styled.li``;

const StyledNavLink = styled(NavLink)`
  font-size: 1rem;
  color: var(--color-text);
  text-decoration: none;
  padding: 0.65rem 0;
  border-radius: 6px;
  &:hover,
  &.active {
    background: var(--color-primary-subtle);
    color: var(--color-primary);
  }
`;

export default function MobileNavMenu() {
  const [open, setOpen] = useState(false);
  const { items } = useInventoryData();
  const archivedItemsExist = items.some((item) => item.Status === "archived");

  const closeMenu = () => setOpen(false);

  return (
    <>
      <Hamburger
        aria-label="Open navigation menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Bar />
        <Bar />
        <Bar />
      </Hamburger>
      <Overlay
        open={open}
        onClick={closeMenu}
        tabIndex={-1}
        aria-hidden={!open}
      />
      <Drawer open={open} aria-label="Mobile navigation drawer">
        <MenuList>
          <MenuItem>
            <StyledNavLink to="/" onClick={closeMenu}>
              Dashboard
            </StyledNavLink>
          </MenuItem>
          <MenuItem>
            <StyledNavLink to="/about" onClick={closeMenu}>
              About
            </StyledNavLink>
          </MenuItem>
          <MenuItem>
            <StyledNavLink to="/settings" onClick={closeMenu}>
              Settings
            </StyledNavLink>
          </MenuItem>
          <MenuItem>
            <StyledNavLink to="/fridge" onClick={closeMenu}>
              Fridge
            </StyledNavLink>
          </MenuItem>
          <MenuItem>
            <StyledNavLink to="/freezer" onClick={closeMenu}>
              Freezer
            </StyledNavLink>
          </MenuItem>
          <MenuItem>
            <StyledNavLink to="/pantry" onClick={closeMenu}>
              Pantry
            </StyledNavLink>
          </MenuItem>
          <MenuItem>
            <StyledNavLink to="/shopping-list" onClick={closeMenu}>
              Shopping List
            </StyledNavLink>
          </MenuItem>
          {archivedItemsExist && (
            <MenuItem>
              <StyledNavLink to="/archive" onClick={closeMenu}>
                Archived Items
              </StyledNavLink>
            </MenuItem>
          )}
        </MenuList>
      </Drawer>
    </>
  );
}
