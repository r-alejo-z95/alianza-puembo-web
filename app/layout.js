'use client';

import NavbarWrapper from "@/components/navbarWrapper";
import Footer from "@/components/footer";
import "./globals.css";
import { Poppins, Merriweather } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { esMX } from "@clerk/localizations";
import { usePathname } from 'next/navigation';

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

// Metadata ya no puede ser exportada directamente en un Client Component
// Si necesitas metadata dinámica, considera usar generateMetadata en un Server Component
// o un archivo layout.js separado para rutas específicas.

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <ClerkProvider localization={esMX} signInForceRedirectUrl="/admin">
      <html
        lang="es"
        className={`${poppins.variable} ${merriweather.variable}`}
      >
        <body className="font-poppins">
          {!isAdminRoute && <NavbarWrapper />}
          {children}
          {!isAdminRoute && <Footer />}
        </body>
      </html>
    </ClerkProvider>
  );
}