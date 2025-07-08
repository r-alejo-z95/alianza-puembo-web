'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import { Home, Calendar, BookOpen, HandHelping, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "/admin/eventos", label: "Eventos", icon: Calendar },
  { href: "/admin/lom", label: "LOM", icon: BookOpen },
  { href: "/admin/oracion", label: "Peticiones", icon: HandHelping },
];

export default function AdminSidebar({ user, children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Estado para controlar el DropdownMenu en mobile
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full bg-gray-100 dark:bg-gray-900">
      {/* Sidebar para pantallas grandes */}
      <aside className="hidden lg:flex w-64 bg-(--puembo-green) text-white p-4 flex-col shadow-lg">
        <div className="mb-8 flex justify-center border-b border-gray-100 pb-4">
          <Link href="/admin">
            <Image
              src="/brand/logo-puembo-white.png"
              alt="Alianza Puembo Admin"
              width={3991}
              height={2592}
              className="object-contain w-[150px] h-auto"
              priority
              sizes="150px"
              unoptimized
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
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[hsl(92,45.9%,40%)] transition-colors text-white shadow-2xl"></Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[hsl(92,45.9%,40%)] transition-colors justify-start text-white w-full">
                <Avatar className="h-8 w-8 shadow-2xl">
                  <AvatarFallback className="text-white bg-(--puembo-black) text-lg font-bold">{getInitials(user?.user_metadata?.full_name || user?.email)}</AvatarFallback>
                </Avatar>
                <span>{user?.user_metadata?.full_name || user?.email || 'Admin'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-(--puembo-black)/30 backdrop-blur-md text-white shadow-md">
              <DropdownMenuLabel className="font-bold">Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => redirect('/admin/preferencias')} className="cursor-pointer transition-colors rounded-md hover:shadow-xl hover:bg-gray-100">Preferencias</DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer transition-colors rounded-md hover:shadow-xl hover:bg-gray-100">Cerrar Sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Botón de menú para pantallas pequeñas */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="bg-(--puembo-green) text-white rounded-full p-2 shadow-md">
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar para pantallas pequeñas (overlay) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-(--puembo-black) bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-(--puembo-green) text-white p-4 flex-col z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:hidden shadow-lg`}>
        <div className="flex flex-col justify-between h-full">
          <div className="mb-8 flex justify-center border-b border-gray-100 pb-4">
            <Link href="/admin" onClick={() => setIsSidebarOpen(false)}>
              <Image
                src="/brand/logo-puembo-white.png"
                alt="Alianza Puembo Admin"
                width={150}
                height={50}
                className="object-contain"
              />
            </Link>
          </div>
          <nav className="flex flex-col space-y-2 flex-grow">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[hsl(92,45.9%,40%)] transition-colors text-white shadow-2xl" onClick={() => setIsSidebarOpen(false)}>
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-4 border-t border-gray-100 pt-4">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[hsl(92,45.9%,40%)] transition-colors text-white shadow-2xl" onClick={() => setIsSidebarOpen(false)}>
              <Home className="h-5 w-5" />
              Ir a Página Principal
            </Link>
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[hsl(92,45.9%,40%)] transition-colors justify-start text-white w-full">
                  <Avatar className="h-8 w-8 shadow-2xl">
                    <AvatarFallback className="text-white bg-(--puembo-black) text-lg font-bold">{getInitials(user?.user_metadata?.full_name || user?.email)}</AvatarFallback>
                  </Avatar>
                  <span>{user?.user_metadata?.full_name || user?.email || 'Admin'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-(--puembo-black)/30 backdrop-blur-md text-white shadow-md">
                <DropdownMenuLabel className="font-bold">Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setIsSidebarOpen(false);
                    setIsDropdownOpen(false);
                    router.push('/admin/preferencias');
                  }}
                  className="cursor-pointer transition-colors rounded-md hover:shadow-xl hover:bg-gray-100"
                >
                  Preferencias
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer transition-colors rounded-md hover:shadow-xl hover:bg-gray-100">Cerrar Sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
      <main className="flex-1 p-2 lg:py-8 lg:px-8 overflow-x-hidden bg-gray-100 dark:bg-gray-900">
        {children}
      </main>
    </div>
  );
}