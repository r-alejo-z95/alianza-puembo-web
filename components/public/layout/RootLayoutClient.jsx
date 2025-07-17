'use client';

import { Navbar } from "@/components/public/layout/navbar/Navbar";
import Footer from "@/components/public/layout/Footer";
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const Toaster = dynamic(() => import('@/components/ui/sonner').then(mod => mod.Toaster), { ssr: false });

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
      <Toaster />
    </>
  );
}