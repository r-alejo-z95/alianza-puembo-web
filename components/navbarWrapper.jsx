// components/NavbarWrapper.jsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./navbar/Navbar";

export default function NavbarWrapper({ children }) {
  const [navbarHeight, setNavbarHeight] = useState(0);
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  return (
    <>
      <Navbar setNavbarHeight={setNavbarHeight} />
      <main
        style={{ marginTop: isHomepage ? 0 : navbarHeight }}
        className="transition-all duration-300"
      >
        {children}
      </main>
    </>
  );
}
