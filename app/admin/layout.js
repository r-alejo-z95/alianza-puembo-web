'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Home, Calendar, BookOpen, HandHelping, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navLinks = [
  { href: "/admin/eventos", label: "Eventos", icon: Calendar },
  { href: "/admin/lom", label: "LOM", icon: BookOpen },
  { href: "/admin/oracion", label: "Peticiones", icon: HandHelping },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar para pantallas grandes */}
      <aside className="hidden lg:flex lg:w-64 bg-(--puembo-green) text-white p-4 flex-col shadow-lg">
        <div className="mb-8 flex justify-center border-b border-gray-100 pb-4">
          <Link href="/admin">
            <Image
              src="/logo-puembo-white.png"
              alt="Alianza Puembo Admin"
              width={150}
              height={50}
              className="object-contain"
            />
          </Link>
        </div>
        <nav className="flex flex-col space-y-2 flex-grow">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[hsl(92,45.9%,40%)] transition-colors text-white shadow-2xl">
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-4 border-t border-gray-100 pt-4">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[hsl(92,45.9%,40%)] transition-colors text-white shadow-2xl">
            <Home className="h-5 w-5" />
            Ir a Página Principal
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[hsl(92,45.9%,40%)] transition-colors justify-start text-white w-full">
                <Avatar className="h-8 w-8 shadow-2xl">
                  <AvatarFallback className="text-white bg-(--puembo-black) text-lg font-bold">{getInitials(user?.user_metadata?.full_name || user?.email)}</AvatarFallback>
                </Avatar>
                <span>{user?.user_metadata?.full_name || user?.email || 'Admin'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white text-gray-900">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/admin/preferencias')}>Preferencias</DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>Cerrar Sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Botón de menú para pantallas pequeñas */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="bg-[hsl(92,45.9%,47.8%)] text-white rounded-full p-2 shadow-md">
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar para pantallas pequeñas (overlay) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-[hsl(345,6%,13%)] bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[hsl(92,45.9%,47.8%)] text-white p-4 flex-col z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:hidden shadow-lg`}>
        <div className="mb-8 flex justify-center">
          <Link href="/admin" onClick={() => setIsSidebarOpen(false)}>
            <Image
              src="/logo-puembo-white.png"
              alt="Alianza Puembo Admin"
              width={150}
              height={50}
              className="object-contain"
            />
          </Link>
        </div>
        <nav className="flex flex-col space-y-2 flex-grow">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[hsl(92,45.9%,40%)] transition-colors text-white" onClick={() => setIsSidebarOpen(false)}>
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-4 border-t border-gray-700 pt-4">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[hsl(92,45.9%,40%)] transition-colors text-white" onClick={() => setIsSidebarOpen(false)}>
            <Home className="h-5 w-5" />
            Ir a Página Principal
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[hsl(92,45.9%,40%)] transition-colors justify-start text-white w-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-black bg-white">{getInitials(user?.user_metadata?.full_name || user?.email)}</AvatarFallback>
                </Avatar>
                <span>{user?.user_metadata?.full_name || user?.email || 'Admin'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white text-gray-900">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { router.push('/admin/preferencias'); setIsSidebarOpen(false); }}>Preferencias</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { handleSignOut(); setIsSidebarOpen(false); }}>Cerrar Sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <main className="flex-1 py-8 px-16 lg:px-8 lg:w-4/5 overflow-x-hidden bg-gray-100 dark:bg-gray-900">
        {children}
      </main>
    </div>
  );
}