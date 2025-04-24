"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Instagram,
  Youtube,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Config
const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/iglesiaalianzapuembo/",
    icon: Facebook,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/iglesiaalianza_puembo/",
    icon: Instagram,
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/c/IglesiaAlianzaPuembo",
    icon: Youtube,
  },
];

const menuItemsLeft = [
  {
    name: "Conócenos",
    subroutes: [
      { name: "Equipo", href: "/conocenos/equipo" },
      { name: "¿En qué creemos?", href: "/conocenos/que-creemos" },
    ],
  },
  {
    name: "Eventos",
    subroutes: [
      { name: "Calendario", href: "/eventos/calendario" },
      { name: "Próximos eventos", href: "/eventos/proximos-eventos" },
    ],
  },
  {
    name: "Ministerios",
    subroutes: [
      { name: "Puembo Kids", href: "/ministerios/puembo-kids" },
      { name: "Jóvenes", href: "/ministerios/jovenes" },
      { name: "Música, artes, tecnología", href: "/ministerios/mat" },
      { name: "Grupos Pequeños", href: "/ministerios/gp" },
      { name: "Misión Dignidad", href: "/ministerios/mision-dignidad" },
    ],
  },
  { name: "Noticias", href: "/noticias" },
];

const menuItemsRight = [
  {
    name: "Recursos",
    subroutes: [
      {
        name: "Prédicas",
        href: "https://www.youtube.com/@IglesiaAlianzaPuembo/playlists",
      },
      { name: "Lee, Ora, Medita", href: "/recursos/lom" },
      { name: "Galería", href: "https://iglesiaalianzapuembo.pixieset.com/" },
    ],
  },
  { name: "Donaciones", href: "/donaciones" },
  { name: "Oración", href: "/oracion" },
  { name: "Contacto", href: "/contacto" },
];

// Component: SmartLink
const SmartLink = ({ href, children, className = "", ...props }) => {
  const isExternal = href.startsWith("http");
  return isExternal ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...props}
    >
      {children}
    </a>
  ) : (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
};

// Component: Dropdown Menu
const DropdownMenu = ({ subroutes, mobile }) => (
  <div
    className={cn(
      "w-full rounded-md z-50 bg-white",
      !mobile && "lg:absolute lg:left-0 lg:w-48"
    )}
  >
    {subroutes.map((sub, i) => (
      <SmartLink
        key={i}
        href={sub.href}
        className={cn(
          "block px-4 py-3 rounded-sm transition-colors",
          mobile
            ? "border-b border-accent/50"
            : "uppercase text-sm hover:bg-accent/50"
        )}
      >
        {sub.name}
      </SmartLink>
    ))}
  </div>
);

// Component: NavItem
const NavItem = ({ title, href, subroutes, mobile }) => {
  const [open, setOpen] = useState(false);

  const baseClasses = cn(
    "flex items-center uppercase font-medium text-white transition-colors w-full justify-between px-4 py-3 lg:px-0 lg:py-0 rounded-md cursor-pointer",
    "hover:bg-accent/50 lg:hover:bg-transparent lg:hover:text-accent",
    "text-lg lg:text-sm xl:text-base"
  );

  if (subroutes) {
    return (
      <div
        className="relative w-full"
        onMouseEnter={() => !mobile && setOpen(true)}
        onMouseLeave={() => !mobile && setOpen(false)}
      >
        <div className={baseClasses} onClick={() => setOpen((prev) => !prev)}>
          <span>{title}</span>
          <ChevronDown className="ml-2 h-4 w-4" />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DropdownMenu subroutes={subroutes} mobile={mobile} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <SmartLink href={href} className={baseClasses}>
      {title}
    </SmartLink>
  );
};

// Component: NavMenu
const NavMenu = ({ items, mobile }) => (
  <nav
    className={cn(
      "items-center gap-8",
      mobile ? "flex-col space-y-4" : "hidden lg:flex"
    )}
  >
    {items.map((item, idx) => (
      <NavItem
        key={idx}
        title={item.name}
        href={item.href}
        subroutes={item.subroutes}
        mobile={mobile}
      />
    ))}
  </nav>
);

// Main Navbar
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const bgClass =
    scrolled || mobileOpen || !isHomepage
      ? "bg-(--puembo-black) shadow-lg"
      : "bg-transparent";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-colors duration-400 ease-in-out",
        !isHomepage && "relative",
        bgClass
      )}
    >
      <div className="flex flex-col pb-2 md:pb-3 lg:pb-0">
        {/* Social */}
        <div className="flex justify-end pt-2 pr-4">
          <div className="flex gap-2">
            {socialLinks.map(({ href, name, icon: Icon }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
              >
                <Icon className="h-5 w-5 text-white hover:text-accent transition-colors" />
              </a>
            ))}
          </div>
        </div>

        {/* Main Nav */}
        <div className="w-full px-4 pb-2 flex items-center justify-between lg:justify-evenly relative">
          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="z-20 block lg:hidden p-2.5"
          >
            {mobileOpen ? (
              <X className="size-6 text-white" />
            ) : (
              <Menu className="size-6 text-white" />
            )}
          </button>

          {/* Left Menu */}
          <NavMenu items={menuItemsLeft} />

          {/* Logo */}
          <div
            className="absolute left-1/2 transform -translate-x-1/2 lg:static lg:translate-x-0 hover:scale-110 transition duration-700"
            onClick={() => mobileOpen && setMobileOpen(false)}
          >
            <Link href="/">
              <Image
                src="/logo-puembo-white.png"
                alt="logo"
                width={120}
                height={78}
                className="w-26 md:w-28 xl:w-30"
              />
            </Link>
          </div>

          {/* Right Menu */}
          <NavMenu items={menuItemsRight} />
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="mt-6 w-full md:w-2/3 max-h-screen mx-auto flex flex-col px-4 py-8 border rounded-lg bg-(--puembo-black) overflow-y-scroll lg:hidden"
            >
              <NavMenu items={menuItemsLeft} mobile />
              <div className="mt-4" />
              <NavMenu items={menuItemsRight} mobile />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
