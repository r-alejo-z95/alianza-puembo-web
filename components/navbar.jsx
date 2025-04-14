"use client";

import { useState } from "react";
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
import { cn } from "@/lib/utils";

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
    href: "/conocenos",
    subroutes: [
      { name: "Historia", href: "/conocenos/historia" },
      { name: "Equipo", href: "/conocenos/equipo" },
      { name: "¿En qué creemos?", href: "/conocenos/que-creemos" },
    ],
  },
  {
    name: "Eventos",
    href: "/eventos",
    subroutes: [
      { name: "Calendario", href: "/eventos/calendario" },
      { name: "Próximos eventos", href: "/eventos/proximos-eventos" },
    ],
  },
  {
    name: "Ministerios",
    href: "/ministerios",
    subroutes: [
      { name: "Niños", href: "/ministerios/ninos" },
      { name: "Jóvenes", href: "/ministerios/jovenes" },
      { name: "Adultos", href: "/ministerios/adultos" },
    ],
  },
  { name: "Noticias", href: "/noticias" },
];

const menuItemsRight = [
  {
    name: "Media",
    href: "/media",
    subroutes: [
      { name: "Prédicas", href: "/media/predicas" },
      { name: "Galería", href: "/media/galeria" },
    ],
  },
  { name: "Donaciones", href: "/donaciones" },
  { name: "Oración", href: "/oracion" },
  { name: "Contáctanos", href: "/contactanos" },
];

const NavItem = ({ title, href, children, mobileMenuState, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (children) {
    return (
      <div
        className={cn("relative w-full", className)}
        onBlur={() => setIsOpen(false)}
      >
        <button
          className={cn(
            "flex items-center uppercase font-medium text-(--puembo-black) lg:text-white transition-colors w-full justify-between px-4 py-3 lg:px-0 lg:py-0 rounded-md lg:hover:text-accent cursor-pointer shadow-xs shadow-gray-400",
            "hover:bg-accent/50", // fondo al hacer hover
            "lg:hover:bg-transparent lg:shadow-transparent", // estilo en desktop
            "text-lg lg:text-base" // más grande solo en móvil
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{title}</span>
          <ChevronDown className="ml-2 h-4 w-4 lg:ml-1" />
        </button>
        {isOpen && (
          <div
            className={cn(
              "mt-2 w-full shadow-inner rounded-md overflow-hidden z-50",
              !mobileMenuState
                ? "bg-muted/80 lg:absolute lg:left-0 lg:w-48"
                : "shadow-xs shadow-gray-400"
            )}
          >
            {children}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center uppercase font-medium text-(--puembo-black) lg:text-white transition-colors w-full justify-between px-4 py-3 lg:px-0 lg:py-0 rounded-md lg:hover:text-accent cursor-pointer shadow-xs shadow-gray-400",
        "hover:bg-accent/50", // fondo al hacer hover
        "lg:hover:bg-transparent lg:shadow-transparent", // estilo en desktop
        "text-lg lg:text-base", // más grande solo en móvil
        className
      )}
    >
      {title}
    </Link>
  );
};

const NavMenu = ({ menuItems, mobileMenuState, className }) => {
  return (
    <nav className={cn("items-center lg:gap-8", className)}>
      {menuItems.map((item, index) => (
        <NavItem
          key={index}
          title={item.name}
          href={item.href}
          mobileMenuState={mobileMenuState}
        >
          {item.subroutes && (
            <div className="py-2">
              {item.subroutes.map((subroute, subIndex) => (
                <Link
                  key={subIndex}
                  href={subroute.href}
                  className={cn(
                    "block hover:bg-accent transition-colors rounded-md px-4 py-2 text-(--puembo-black)",
                    !mobileMenuState ? " uppercase text-sm" : ""
                  )}
                >
                  {subroute.name}
                </Link>
              ))}
            </div>
          )}
        </NavItem>
      ))}
    </nav>
  );
};

export default function Navbar() {
  const [mobileMenuState, setMobileMenuState] = useState(false);

  return (
    <header>
      <div
        className={cn(
          "flex flex-col",
          mobileMenuState &&
            "backdrop-blur-sm bg-gradient-to-b from-white/15 to-transparent"
        )}
      >
        {/* Social Icons */}
        <div className="flex justify-end pt-2 pr-4">
          <div className="flex gap-2">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
              >
                <social.icon className="h-5 w-5 text-white hover:text-accent transition-colors" />
              </a>
            ))}
          </div>
        </div>

        {/* Main Navigation */}
        <div className="w-full px-4 pb-2 flex items-center justify-between lg:justify-evenly relative">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuState(!mobileMenuState)}
            aria-label={mobileMenuState ? "Close Menu" : "Open Menu"}
            className="z-20 block cursor-pointer p-2.5 lg:hidden"
          >
            {mobileMenuState ? (
              <X className="size-6 text-white" />
            ) : (
              <Menu className="size-6 text-white" />
            )}
          </button>

          {/* Left Menu */}
          <NavMenu menuItems={menuItemsLeft} className="hidden lg:flex" />

          {/* Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2 lg:static lg:translate-x-0 flex-shrink-0 hover:scale-110 transition duration-700">
            <Link href="/">
              <Image
                src="/logo-puembo-white.png"
                alt="logo"
                width={120}
                height={78}
                className="w-26 md:w-30"
              />
            </Link>
          </div>

          {/* Placeholder to balance layout on small screens */}
          <div className="w-10 lg:hidden" />

          {/* Right Menu */}
          <NavMenu menuItems={menuItemsRight} className="hidden lg:flex" />
        </div>

        {/* Mobile Menu */}
        {mobileMenuState && (
          <div className="mt-2 w-5/6 h-fit mx-auto bg-white flex flex-col px-4 py-8 items-start lg:hidden shadow-md shadow-black/30 overflow-y-scroll rounded-lg">
            <NavMenu
              menuItems={menuItemsLeft}
              className="flex flex-col space-y-4 w-full pr-4"
              mobileMenuState={mobileMenuState}
            />
            <NavMenu
              menuItems={menuItemsRight}
              className="flex flex-col space-y-4 mt-4 w-full pr-4"
              mobileMenuState={mobileMenuState}
            />
          </div>
        )}
      </div>
    </header>
  );
}
