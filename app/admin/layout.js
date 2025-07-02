'use client';

import Link from "next/link";
import { Home, Calendar, BookOpen, HandHelping, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/admin", label: "Inicio", icon: Home },
  { href: "/admin/eventos", label: "Eventos", icon: Calendar },
  { href: "/admin/lom", label: "LOM", icon: BookOpen },
  { href: "/admin/oracion", label: "Peticiones", icon: HandHelping },
];

export default function AdminLayout({ children }) {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-(--puembo-green) text-white p-4 flex flex-col">
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
          <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[hsl(92,45.9%,40%)] transition-colors justify-start text-white">
            <Settings className="h-5 w-5" />
            Preferencias
          </Button>
          <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[hsl(92,45.9%,40%)] transition-colors justify-start text-white" onClick={handleSignOut}>
            <Home className="h-5 w-5" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}