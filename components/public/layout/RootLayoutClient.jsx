'use client';

import { Navbar } from "@/components/public/layout/navbar/Navbar";
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

  return (
    <html
      lang="es"
      className={`${poppins.variable} ${merriweather.variable}`}
    >
      <body className="font-poppins">
        {!isAuthRoute && <Navbar />}
        <main>
          {children}
        </main>
        {!isAuthRoute && <Footer />}
        <Toaster />
      </body>
    </html>
  );
}