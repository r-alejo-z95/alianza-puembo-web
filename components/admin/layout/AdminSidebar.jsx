"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Calendar,
  BookOpen,
  HandHelping,
  FileText,
  Newspaper,
  Settings,
  LogOut,
  ChevronRight,
  User,
  Users,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils.ts";
import { createClient } from "@/lib/supabase/client";
import { AdminBottomNav } from "./AdminBottomNav";
import { NotificationBell } from "./NotificationBell";

const navLinks = [
  {
    href: "/admin/eventos",
    label: "Eventos",
    icon: Calendar,
    description: "Gestión de actividades",
    permission: "perm_events",
  },
  {
    href: "/admin/noticias",
    label: "Noticias",
    icon: Newspaper,
    description: "Crónicas y novedades",
    permission: "perm_news",
  },
  {
    href: "/admin/lom",
    label: "LOM",
    icon: BookOpen,
    description: "Devocionales diarios",
    permission: "perm_lom",
  },
  {
    href: "/admin/comunidad",
    label: "Comunidad",
    icon: Users,
    description: "Mensajes y peticiones",
    permission: "perm_comunidad",
  },
  {
    href: "/admin/formularios",
    label: "Formularios",
    icon: FileText,
    description: "Constructor dinámico",
    permission: "perm_forms",
  },
  {
    href: "/admin/staff",
    label: "Staff",
    icon: ClipboardList,
    description: "Procesos Operativos",
    permission: "perm_internal_forms",
  },
];

export default function AdminSidebar({ user, children }) {
  const pathname = usePathname();
  const router = useRouter();

  // Si es la página de vista previa o de proceso staff, renderizar el contenido puro
  if (
    pathname.includes("/formularios/preview") ||
    pathname.includes("/admin/staff/proceso/")
  ) {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  // Filtrar links según permisos del usuario
  const filteredLinks = navLinks.filter((link) => {
    if (user?.is_super_admin) return true; // Super Admin ve todo
    return user?.permissions?.[link.permission];
  });

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "local" });
    window.location.href = "/";
  };

  const getInitials = (name) => {
    if (!name) return "A";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const NavItem = ({ link, onClick }) => {
    const isActive = pathname.startsWith(link.href);
    return (
      <Link
        href={link.href}
        className={cn(
          "group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300",
          isActive
            ? "bg-[var(--puembo-green)] text-white shadow-lg shadow-[var(--puembo-green)]/20"
            : "text-gray-400 hover:text-white hover:bg-white/5",
        )}
        onClick={onClick}
      >
        <div
          className={cn(
            "p-2 rounded-xl transition-colors duration-300",
            isActive ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10",
          )}
        >
          <link.icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-wide">{link.label}</span>
          <span
            className={cn(
              "text-[10px] uppercase tracking-widest font-medium opacity-60",
              isActive ? "text-white" : "text-gray-500",
            )}
          >
            {link.description}
          </span>
        </div>
        {isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
      </Link>
    );
  };

  return (
    <div className="flex w-full bg-gray-50/50 font-sans text-gray-900 relative">
      {/* Móvil: Header Superior (Solo visible en < MD) */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-md border-b border-white/10 z-[101] flex items-center justify-between px-6 shadow-2xl">
        <Link href="/admin">
          <Image
            src="/brand/logo-puembo-white.png"
            alt="Logo"
            width={100}
            height={40}
            className="h-6 w-auto"
          />
        </Link>
        <div className="flex items-center gap-2">
          <NotificationBell userId={user?.id} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl hover:bg-white/10 p-0 overflow-hidden border border-white/10 transition-all active:scale-95"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[var(--puembo-green)] text-white text-[10px] font-black">
                    {getInitials(user?.user_metadata?.full_name || user?.email)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-[2rem] bg-white border-none shadow-2xl p-2 mt-2 z-[100]"
            >
              <div className="px-4 py-3 mb-1 border-b border-gray-50">
                <p className="text-xs font-bold text-gray-900 truncate">
                  {user?.user_metadata?.full_name || "Administrador"}
                </p>
                <p className="text-[10px] text-gray-400 truncate tracking-tight">
                  {user?.email}
                </p>
              </div>
              <DropdownMenuItem
                onClick={() => router.push("/admin/preferencias")}
                className="rounded-[1.2rem] py-3 px-4 focus:bg-gray-50 flex items-center gap-3 cursor-pointer group"
              >
                <div className="p-2 rounded-xl bg-gray-50 group-focus:bg-white transition-colors">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <span className="text-xs font-bold text-gray-700">
                  Ajustes de Perfil
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSignOut}
                className="rounded-[1.2rem] py-3 px-4 focus:bg-red-50 flex items-center gap-3 cursor-pointer group"
              >
                <div className="p-2 rounded-xl bg-red-50/50 group-focus:bg-white transition-colors">
                  <LogOut className="h-4 w-4 text-red-500" />
                </div>
                <span className="text-xs font-bold text-red-600">
                  Cerrar Sesión
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Sidebar Desktop (Visible desde MD) */}
      <aside className="hidden md:flex w-72 lg:w-80 bg-black text-white p-5 lg:p-6 flex-col border-r border-white/5 relative z-50 shrink-0 sticky top-0 h-screen overflow-y-auto scrollbar-none">
        <div className="px-2 mb-8">
          <Link
            href="/admin"
            className="block group transition-all duration-500 hover:opacity-80"
          >
            <Image
              src="/brand/logo-puembo-white.png"
              alt="Alianza Puembo Admin"
              width={160}
              height={100}
              className="h-auto w-24 lg:w-28 mx-auto"
              priority
            />
            <div className="mt-4 flex items-center gap-3">
              <div className="h-px w-6 bg-[var(--puembo-green)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                Panel de Control
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex flex-col space-y-1 grow">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-600 px-4 mb-2">
            Administración
          </p>
          {filteredLinks.map((link) => (
            <NavItem key={link.href} link={link} />
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between gap-2 pl-2 pr-4">
            <Link
              href="/"
              className="flex-1 flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
            >
              <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10">
                <Home className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-bold tracking-wide">
                Sitio Público
              </span>
            </Link>
            <NotificationBell userId={user?.id} />
          </div>

          <div className="p-3 bg-white/5 rounded-[1.5rem] border border-white/5">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-[var(--puembo-green)]/30">
                <AvatarFallback className="bg-[var(--puembo-green)] text-white text-base font-black">
                  {getInitials(user?.user_metadata?.full_name || user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold truncate">
                  {user?.user_metadata?.full_name || "Administrador"}
                </span>
                <span className="text-[9px] text-gray-500 tracking-wider truncate italic">
                  {user?.email}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/preferencias")}
                className="rounded-xl hover:bg-white/10 text-gray-400 hover:text-white text-[10px] h-8 gap-2"
              >
                <Settings className="h-3 w-3" /> Ajustes
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 text-[10px] h-8 gap-2"
              >
                <LogOut className="h-3 w-3" /> Salir
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Móvil: Barra de Navegación Inferior (Oculto desde MD) */}
      <AdminBottomNav user={user} />

      <main className="flex-1 h-screen overflow-y-auto relative bg-gray-50/50 pb-24 md:pb-0 pt-16 md:pt-0">
        <div className="absolute inset-0 bg-grid-black/[0.5] -z-10 pointer-events-none" />
        <div
          className={cn(
            "max-w-7xl mx-auto py-6 md:py-16 lg:px-12",
            pathname.includes("/formularios/builder") ? "px-2" : "px-6",
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
