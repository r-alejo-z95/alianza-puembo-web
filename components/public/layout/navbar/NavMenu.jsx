// Menú de navegación que agrupa los elementos

import NavItem from "./NavItem";

const NavMenu = ({ items, mobile, onLinkClick }) => (
  <nav
    className={`items-center ${mobile ? "flex-col space-y-4" : "hidden lg:flex gap-8"}`}>
    {items.map((item, idx) => (
      <NavItem
        key={idx}
        title={item.name}
        href={item.href}
        subroutes={item.subroutes}
        mobile={mobile}
        onLinkClick={onLinkClick}
      />
    ))}
  </nav>
);

export default NavMenu;
