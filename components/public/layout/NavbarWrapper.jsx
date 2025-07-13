// components/NavbarWrapper.jsx
"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./navbar/Navbar";

export default function NavbarWrapper() {
  return (
    <>
      <Navbar />
    </>
  );
}