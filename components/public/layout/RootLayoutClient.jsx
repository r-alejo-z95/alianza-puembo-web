'use client';

import { Navbar } from "@/components/public/layout/navbar/Navbar";
import Footer from "@/components/public/layout/Footer";
import { usePathname } from 'next/navigation';


export default function RootLayoutClient({ children }) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith('/admin') || pathname === '/login';

  return (
    <>
      {!isAuthRoute && <Navbar />}
      <main>
        {children}
      </main>
      {!isAuthRoute && <Footer />}

    </>
  );
}