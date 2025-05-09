// Menú desplegable para subrutas

import SmartLink from "./SmartLink";

const DropdownMenu = ({ subroutes, mobile, onLinkClick }) => (
  <div
    className={`w-full rounded-md z-50 bg-white ${
      !mobile && "lg:absolute lg:left-0 lg:w-48"
    }`}
  >
    {subroutes.map((sub, i) => (
      <SmartLink
        key={i}
        href={sub.href}
        className={`block px-4 py-3 rounded-md transition-colors ${
          mobile
            ? "border-b border-accent"
            : "uppercase text-sm hover:bg-accent"
        }`}
        onClick={onLinkClick}
      >
        {sub.name}
      </SmartLink>
    ))}
  </div>
);

export default DropdownMenu;
