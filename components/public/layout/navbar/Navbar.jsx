// Componente principal de la barra de navegación

"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NavMenu from "./NavMenu";
import MobileMenu from "./MobileMenu";
import { socialLinks, menuItems } from "./config";
import { cn } from "@/lib/utils";
import { useNavbarLogic } from "@/lib/hooks/useNavbarLogic";
import { dropShadow } from "@/lib/styles";

const Navbar = ({ setNavbarHeight }) => {
  const {
    mobileOpen,
    navbarRef,
    bgClass,
    toggleMobileMenu,
    closeMobileMenu,
    setNavbarHeight: setNavbarHeightFromHook,
  } = useNavbarLogic();

  // Pasar setNavbarHeight del hook al prop del componente padre
  // Esto asegura que el NavbarWrapper reciba la altura correcta
  useEffect(() => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight);
    }
  }, [navbarRef, setNavbarHeight]);

  const leftItems = menuItems.filter((item) => item.position === "left");
  const rightItems = menuItems.filter((item) => item.position === "right");

  return (
    <header
      ref={navbarRef}
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        bgClass
      )}
    >
      <div className="flex flex-col pb-2">
        {/* Social */}
        <div className="flex justify-end pt-2 pr-4 absolute right-0 z-1">
          <div className="flex gap-2 2xl:gap-4">
            {socialLinks.map(({ name, href, icon: Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className={cn(
                  "text-primary-foreground hover:text-accent",
                  dropShadow
                )}
              >
                <Icon className="h-4 w-4 2xl:h-8 2xl:w-8" />
              </a>
            ))}
          </div>
        </div>

        {/* Main Nav */}
        <div className="w-full px-4 pt-2 pb-1 lg:pb-0 flex items-center md:justify-between lg:justify-evenly xl:justify-around gap-4 relative">
          {/* Mobile Toggle */}
          <button
            onClick={toggleMobileMenu}
            className={cn(
              "text-primary-foreground p-4 lg:hidden",
              dropShadow
            )}
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Desktop Menu */}
          <NavMenu items={leftItems} />
          {/* Logo */}
          <div
            className="absolute left-1/2 transform -translate-x-1/2 lg:static lg:translate-x-0 hover:scale-105 transition duration-700">
            <Link href="/" onClick={closeMobileMenu}>
              <Image
                src="/brand/logo-puembo-white.png"
                alt="Iglesia Alianza Puembo"
                width={3991}
                height={2592}
                priority
                className={cn("w-26 xl:w-28 2xl:w-36", dropShadow)}
                unoptimized
              />
            </Link>
          </div>
          <NavMenu items={rightItems} />
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-primary"
          >
            <MobileMenu items={menuItems} onLinkClick={closeMobileMenu} />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;