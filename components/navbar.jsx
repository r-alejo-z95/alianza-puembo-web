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
            <NavItem title="About Us" href="/about">
              <div className="py-2">
                <Link
                  href="/about/history"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Our History
                </Link>
                <Link
                  href="/about/staff"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Staff
                </Link>
                <Link
                  href="/about/beliefs"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  What We Believe
                </Link>
              </div>
            </NavItem>
            <NavItem title="Events" href="/events">
              <div className="py-2">
                <Link
                  href="/events/calendar"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Calendar
                </Link>
                <Link
                  href="/events/upcoming"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Upcoming Events
                </Link>
              </div>
            </NavItem>
            <NavItem title="Ministries" href="/ministries">
              <div className="py-2">
                <Link
                  href="/ministries/children"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Children
                </Link>
                <Link
                  href="/ministries/youth"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Youth
                </Link>
                <Link
                  href="/ministries/adults"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Adults
                </Link>
              </div>
            </NavItem>
            <NavItem title="News" href="/news" />
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
            <NavItem title="Media" href="/media">
              <div className="py-2">
                <Link
                  href="/media/sermons"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Sermons
                </Link>
                <Link
                  href="/media/photos"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Photo Gallery
                </Link>
              </div>
            </NavItem>
            <NavItem title="Give" href="/give" />
            <NavItem title="Contact" href="/contact" />
          </nav>
        </div>
      </div>
    </header>
  );
}
