import NavMenu from "./NavMenu.component";

function Header({ visibleFields, onToggleField, onResetFields }) {
  return (
    <header>
      <h1>Kitchen Inventory</h1>
      <p>Manage your kitchen items efficiently.</p>
      <NavMenu
        visibleFields={visibleFields}
        onToggleField={onToggleField}
        onResetFields={onResetFields}
      />
    </header>
  );
}

export default Header;
