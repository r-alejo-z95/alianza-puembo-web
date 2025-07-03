'use client';

import NavbarWrapper from "@/components/navbarWrapper";
import Footer from "@/components/footer";
import "./globals.css";
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

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith('/admin') || pathname === '/login';

  return (
    <html
      lang="es"
      className={`${poppins.variable} ${merriweather.variable}`}
    >
      <body className="font-poppins">
        {!isAuthRoute && <NavbarWrapper />}
        {children}
        {!isAuthRoute && <Footer />}
        <Toaster />
      </body>
    </html>
  );
}