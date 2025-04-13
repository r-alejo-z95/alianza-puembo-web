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

const NavItem = ({ title, href, children, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (children) {
    return (
      <div
        className={cn("relative group", className)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <button
          className="flex items-center uppercase font-medium text-white hover:text-accent cursor-pointer transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {title} <ChevronDown className="ml-1 h-4 w-4" />
        </button>
        {isOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-muted/80 shadow-lg rounded-md overflow-hidden z-50">
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
        "uppercase font-medium text-white hover:text-accent transition-colors",
        className
      )}
    >
      {title}
    </Link>
  );
};

const NavMenu = ({ menuItems, className }) => {
  return (
    <nav className={cn("items-center lg:gap-8", className)}>
      {menuItems.map((item, index) => (
        <NavItem key={index} title={item.name} href={item.href}>
          {item.subroutes && (
            <div className="py-2">
              {item.subroutes.map((subroute, subIndex) => (
                <Link
                  key={subIndex}
                  href={subroute.href}
                  className="block px-4 py-2 text-(--puembo-black) hover:bg-accent"
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
    <header className="">
      <div className="bg-gradient-to-b from-(--puembo-black)/100 to-transparent">
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
        <div className="min-w-screen px-4 pb-2 flex items-center lg:justify-evenly">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuState(!mobileMenuState)}
            aria-label={mobileMenuState ? "Close Menu" : "Open Menu"}
            className="relative z-20 block cursor-pointer p-2.5 lg:hidden"
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
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                src="/logo-puembo-white.png"
                alt="logo"
                width={120}
                height={78}
                className="sm:w-30 md:w-36"
              />
            </Link>
          </div>

          {/* Right Menu */}
          <NavMenu menuItems={menuItemsRight} className="hidden lg:flex" />
        </div>

        {/* Mobile Menu */}
        {mobileMenuState && (
          <div className="w-full h-screen bg-muted/60 flex flex-col pl-4 pt-8 items-start">
            <NavMenu
              menuItems={menuItemsLeft}
              className="flex flex-col space-y-4"
            />
            <NavMenu
              menuItems={menuItemsRight}
              className="flex flex-col space-y-4 mt-4"
            />
          </div>
        )}
      </div>
    </header>
  );
}
