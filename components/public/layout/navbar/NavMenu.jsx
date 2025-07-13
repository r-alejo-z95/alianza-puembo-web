// Menú de navegación que agrupa los elementos para desktop

import NavItem from "./NavItem";

const NavMenu = ({ items, onLinkClick }) => (
  <nav className="flex items-center flex-wrap justify-end gap-x-6 gap-y-2">
    {items.map((item, idx) => (
      <NavItem
        key={idx}
        title={item.name}
        href={item.href}
        subroutes={item.subroutes}
        onLinkClick={onLinkClick}
      />
    ))}
  </nav>
);

export default NavMenu;