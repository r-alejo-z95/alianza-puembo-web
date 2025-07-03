'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, Calendar, BookOpen, HandHelping } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navLinks = [
  { href: "/admin", label: "Inicio", icon: Home },
  { href: "/admin/eventos", label: "Eventos", icon: Calendar },
  { href: "/admin/lom", label: "LOM", icon: BookOpen },
  { href: "/admin/oracion", label: "Peticiones", icon: HandHelping },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

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
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-[hsl(92,45.9%,47.8%)] text-white p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-8 text-white">Admin Dashboard</h1>
        <nav className="flex flex-col space-y-2 flex-grow">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[hsl(92,45.9%,40%)] transition-colors">
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[hsl(92,45.9%,40%)] transition-colors">
            <Home className="h-5 w-5" />
            Ir a Página Principal
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-3 py-6 rounded-md hover:bg-[hsl(92,45.9%,40%)] transition-colors justify-start text-white">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-black">{getInitials(user?.user_metadata?.full_name || user?.email)}</AvatarFallback>
                </Avatar>
                <span>{user?.user_metadata?.full_name || user?.email || 'Admin'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/admin/preferencias')}>Preferencias</DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>Cerrar Sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}