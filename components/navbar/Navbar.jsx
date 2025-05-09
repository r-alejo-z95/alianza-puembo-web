// Componente principal de la barra de navegación

"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NavMenu from "./NavMenu";
import MobileMenu from "./MobileMenu";
import { socialLinks, menuItems } from "./config";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const leftItems = menuItems.filter((item) => item.position === "left");
  const rightItems = menuItems.filter((item) => item.position === "right");

  const toggleMobileMenu = () => setMobileOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileOpen(false);

  const bgClass =
    scrolled || mobileOpen || !isHomepage ? "bg-primary" : "bg-transparent";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        !isHomepage && "relative",
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
                className="text-white hover:text-accent"
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
            className="text-white p-4 lg:hidden"
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
          <div className="absolute left-1/2 transform -translate-x-1/2 lg:static lg:translate-x-0  hover:scale-105 transition duration-700">
            <Link href="/" onClick={closeMobileMenu}>
              <Image
                src="/logo-puembo-white.png"
                alt="Iglesia Alianza Puembo"
                width={3991}
                height={2592}
                className="w-26 xl:w-28 2xl:w-36"
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
