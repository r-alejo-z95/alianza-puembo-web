
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export const useNavbarLogic = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight);
    }
  }, [navbarRef]); // Dependencia cambiada a navbarRef

  const toggleMobileMenu = () => setMobileOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileOpen(false);

  const bgClass =
    scrolled || mobileOpen || !isHomepage ? "bg-primary" : "bg-transparent";

  return {
    mobileOpen,
    scrolled,
    isHomepage,
    navbarRef,
    navbarHeight,
    bgClass,
    toggleMobileMenu,
    closeMobileMenu,
    setNavbarHeight,
  };
};
