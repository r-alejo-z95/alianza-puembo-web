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
          className="flex items-center uppercase font-medium text-white hover:text-muted cursor-pointer transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {title} <ChevronDown className="ml-1 h-4 w-4" />
        </button>
        {isOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-muted shadow-lg rounded-md overflow-hidden z-50">
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
        "uppercase font-medium text-white hover:text-muted transition-colors",
        className
      )}
    >
      {title}
    </Link>
  );
};

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="bg-(--puembo-green) flex flex-col">
        {/* Social Icons */}
        <div className="flex justify-end p-2 pr-4">
          <div className="flex gap-2">
            <Link href="#" aria-label="Facebook">
              <Facebook className="h-5 w-5 text-white hover:text-muted transition-colors" />
            </Link>
            <Link href="#" aria-label="Instagram">
              <Instagram className="h-5 w-5 text-white hover:text-muted transition-colors" />
            </Link>
            <Link href="#" aria-label="YouTube">
              <Youtube className="h-5 w-5 text-white hover:text-muted transition-colors" />
            </Link>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="min-w-screen px-4 py-2 flex items-center justify-evenly">
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItemsLeft.map((item, index) => (
              <NavItem key={index} title={item.name} href={item.href}>
                {item.subroutes && (
                  <div className="py-2">
                    {item.subroutes.map((subroute, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subroute.href}
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        {subroute.name}
                      </Link>
                    ))}
                  </div>
                )}
              </NavItem>
            ))}
          </nav>

          {/* Logo */}
          <div className="  ">
            <Link href="/">
              <Image
                src="/logo-puembo-white.png"
                alt="logo"
                width={3991}
                height={2592}
                className="w-48"
              />
            </Link>
          </div>

          {/* Right Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItemsRight.map((item, index) => (
              <NavItem key={index} title={item.name} href={item.href}>
                {item.subroutes && (
                  <div className="py-2">
                    {item.subroutes.map((subroute, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subroute.href}
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        {subroute.name}
                      </Link>
                    ))}
                  </div>
                )}
              </NavItem>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
