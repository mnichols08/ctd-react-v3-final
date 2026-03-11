import styled from "styled-components";
import {
  FooterContainer,
  FooterText,
  FooterLink,
} from "./Footer.styles";

const FooterCode = styled.span`
  color: var(--color-primary);
  font-weight: var(--font-bold);
`;
const FooterHeart = styled.span`
  color: var(--color-danger);
  font-weight: var(--font-bold);
`;

function Footer() {
  return (
    <FooterContainer aria-label="Site footer">
      <FooterText>&copy; 2026 Kitchen Inventory App</FooterText>
      <FooterText>
        <FooterCode>&lt; /&gt;</FooterCode> with{" "}
        <FooterHeart>&lt;3</FooterHeart> by{" "}
        <FooterLink
          href="https://github.com/mnichols08"
          target="_blank"
          rel="noopener noreferrer"
        >
          mnichols08
        </FooterLink>{" "}
        |{" "}
        <FooterLink
          href="https://github.com/mnichols08/ctd-react-v3-final"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source Code
        </FooterLink>
      </FooterText>
    </FooterContainer>
  );
}

export default Footer;
