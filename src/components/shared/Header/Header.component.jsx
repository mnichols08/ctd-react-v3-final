import { memo } from "react";
import styled from "styled-components";
import NavMenu from "./NavMenu.component";
import MobileNavMenu from "./MobileNavMenu.component";

const HeaderContainer = styled.header`
  width: 100%;
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: 0 2px 8px var(--color-border-strong, rgba(0, 0, 0, 0.08));
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.25rem 0.5rem 0.25rem 0.5rem;
  position: sticky;
  top: 0;
  z-index: 1100;
  @media (min-width: 481px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 2rem;
  }
`;

const Title = styled.p`
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.1em 0;
  letter-spacing: 0.01em;
  color: var(--color-text);
  @media (min-width: 481px) {
    font-size: 1.35rem;
    margin: 0 0 0.15em 0;
  }
`;

const Subtitle = styled.p`
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin: 0 0 0.25em 0;
  @media (min-width: 481px) {
    font-size: 1rem;
    margin: 0 1.5em 0 0;
  }
`;

function Header() {
  return (
    <HeaderContainer aria-label="Site header">
      <div style={{ flex: 1 }}>
        <Title>Kitchen Inventory</Title>
        <Subtitle>Manage your kitchen items efficiently.</Subtitle>
      </div>
      <MobileNavMenu />
      <NavMenu />
    </HeaderContainer>
  );
}

export default memo(Header);
