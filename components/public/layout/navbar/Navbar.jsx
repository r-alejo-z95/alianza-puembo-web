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
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 py-1",
        bgClass
      )}
    >
      <div className="flex flex-col">
        {/* Social */}
        <div className="flex justify-end pt-2 pr-4 absolute right-0 z-1">
          <div className="flex gap-2">
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
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Main Nav */}
        <div className="container mx-auto px-4 lg:px-20 h-[70px] flex items-center lg:justify-around">
          {/* Left Menu & Mobile Toggle */}
          <div className="flex-1 flex justify-start items-center">
            <div className="lg:hidden flex">
              <button
                onClick={toggleMobileMenu}
                className={cn(
                  "text-primary-foreground p-2",
                  dropShadow
                )}
              >
                {mobileOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
            <div className="hidden lg:flex">
              <NavMenu items={leftItems} />
            </div>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 mx-2">
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className={cn(
                "hover:scale-105 transition duration-700",
                dropShadow
              )}
            >
              <Link href="/" onClick={closeMobileMenu}>
                <Image
                  src="/brand/logo-puembo-white.png"
                  alt="Iglesia Alianza Puembo"
                  width={150}
                  height={97}
                  priority
                  className={cn("w-24 h-auto", dropShadow)}
                  sizes="100px"
                />
              </Link>
            </motion.div>
          </div>

          {/* Right Menu */}
          <div className="flex-1 flex justify-end items-center">
            <div className="hidden lg:flex">
              <NavMenu items={rightItems} />
            </div>
          </div>
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