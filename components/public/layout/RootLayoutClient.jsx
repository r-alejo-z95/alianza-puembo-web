'use client';

import { useState } from 'react';
import NavbarWrapper from "@/components/public/layout/NavbarWrapper";
import Footer from "@/components/public/layout/Footer";
import "@/app/globals.css";
import { Poppins, Merriweather } from "next/font/google";
import { usePathname } from 'next/navigation';
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-merriweather",
});

export default function RootLayoutClient({ children }) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith('/admin') || pathname === '/login';
  const [navbarHeight, setNavbarHeight] = useState(0);

  return (
    <html
      lang="es"
      className={`${poppins.variable} ${merriweather.variable}`}
    >
      <body className="font-poppins">
        {!isAuthRoute && <NavbarWrapper setNavbarHeight={setNavbarHeight} />}
        <main style={{ paddingTop: (isAuthRoute || pathname === '/') ? 0 : (navbarHeight) }}>
          {children}
        </main>
        {!isAuthRoute && <Footer />}
        <Toaster />
      </body>
    </html>
  );
}