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
  Menu,
  FileText,
  Newspaper,
  Settings,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils.ts";
import { createClient } from "@/lib/supabase/client";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  {
    href: "/admin/eventos",
    label: "Eventos",
    icon: Calendar,
    description: "Gestión de actividades",
  },
  {
    href: "/admin/noticias",
    label: "Noticias",
    icon: Newspaper,
    description: "Crónicas y novedades",
  },
  {
    href: "/admin/lom",
    label: "LOM",
    icon: BookOpen,
    description: "Devocionales diarios",
  },
  {
    href: "/admin/oracion",
    label: "Peticiones",
    icon: HandHelping,
    description: "Muro de oración",
  },
  {
    href: "/admin/formularios",
    label: "Formularios",
    icon: FileText,
    description: "Constructor dinámico",
  },
];

export default function AdminSidebar({ user, children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
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
            : "text-gray-400 hover:text-white hover:bg-white/5"
        )}
        onClick={onClick}
      >
        <div
          className={cn(
            "p-2 rounded-xl transition-colors duration-300",
            isActive ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10"
          )}
        >
          <link.icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-wide">{link.label}</span>
          <span
            className={cn(
              "text-[10px] uppercase tracking-widest font-medium opacity-60",
              isActive ? "text-white" : "text-gray-500"
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
    <div className="flex h-screen w-full bg-gray-50/50 overflow-hidden font-sans text-gray-900">
      {/* Sidebar Desktop (Visible desde MD) */}
      <aside className="hidden md:flex w-72 lg:w-80 bg-black text-white p-6 flex-col border-r border-white/5 relative z-50 shrink-0">
        <div className="mb-12 px-2">
          <Link
            href="/admin"
            className="block group transition-all duration-500 hover:opacity-80"
          >
            <Image
              src="/brand/logo-puembo-white.png"
              alt="Alianza Puembo Admin"
              width={160}
              height={100}
              className="h-auto w-28 lg:w-32"
              priority
            />
            <div className="mt-4 flex items-center gap-3">
              <div className="h-px w-8 bg-[var(--puembo-green)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                Panel de Control
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex flex-col space-y-3 grow">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 px-4 mb-2">
            Administración
          </p>
          {navLinks.map((link) => (
            <NavItem key={link.href} link={link} />
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
          <Link
            href="/"
            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
          >
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10">
              <Home className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold tracking-wide">
              Sitio Público
            </span>
          </Link>

          <div className="p-4 bg-white/5 rounded-[2rem] border border-white/5">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-[var(--puembo-green)]/30">
                <AvatarFallback className="bg-[var(--puembo-green)] text-white text-lg font-black">
                  {getInitials(user?.user_metadata?.full_name || user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold truncate">
                  {user?.user_metadata?.full_name || "Administrador"}
                </span>
                <span className="text-[10px] text-gray-500 tracking-wider truncate italic">
                  {user?.email}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/preferencias")}
                className="rounded-xl hover:bg-white/10 text-gray-400 hover:text-white text-xs gap-2"
              >
                <Settings className="h-3.5 w-3.5" /> Ajustes
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 text-xs gap-2"
              >
                <LogOut className="h-3.5 w-3.5" /> Salir
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Móvil: Botón Menú (Oculto desde MD) */}
      <div className="md:hidden fixed top-6 left-6 z-[100]">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={cn(
            "rounded-full p-2 shadow-2xl transition-all duration-500 border",
            isSidebarOpen
              ? "bg-white text-black border-transparent"
              : "bg-black text-white border-white/10"
          )}
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </Button>
      </div>

      {/* Sidebar Móvil (Overlay) (Oculto desde MD) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-black text-white p-8 flex flex-col z-[90] md:hidden"
            >
              <div className="mb-12">
                <Link href="/admin" onClick={() => setIsSidebarOpen(false)}>
                  <Image
                    src="/brand/logo-puembo-white.png"
                    alt="Alianza Puembo"
                    width={140}
                    height={90}
                    className="h-auto w-32"
                  />
                </Link>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-px w-8 bg-[var(--puembo-green)]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                    Panel Admin
                  </span>
                </div>
              </div>

              <nav className="flex flex-col space-y-4 grow">
                {navLinks.map((link) => (
                  <NavItem
                    key={link.href}
                    link={link}
                    onClick={() => setIsSidebarOpen(false)}
                  />
                ))}
              </nav>

              <div className="mt-auto space-y-6 pt-8 border-t border-white/5">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-[2rem] border border-white/5">
                  <Avatar className="h-12 w-12 border-2 border-[var(--puembo-green)]/30">
                    <AvatarFallback className="bg-[var(--puembo-green)] text-white font-black">
                      {getInitials(
                        user?.user_metadata?.full_name || user?.email
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-bold truncate">
                      {user?.user_metadata?.full_name || "Admin"}
                    </span>
                    <span className="text-[10px] text-gray-500 truncate">
                      {user?.email}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="ghost"
                    className="rounded-2xl bg-white/5 text-xs font-bold py-6 gap-2 text-white"
                    onClick={() => {
                      router.push("/admin/preferencias");
                      setIsSidebarOpen(false);
                    }}
                  >
                    <Settings className="h-4 w-4" /> Perfil
                  </Button>
                  <Button
                    variant="ghost"
                    className="rounded-2xl bg-red-500/10 text-red-400 text-xs font-bold py-6 gap-2"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" /> Salir
                  </Button>
                </div>
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors pt-2"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Home className="h-3 w-3" /> Volver al Inicio
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 h-screen overflow-y-auto relative bg-gray-50/50">
        <div className="absolute inset-0 bg-grid-black/[0.02] -z-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto py-12 px-6 md:py-16 lg:px-12">
          {children}
        </div>
      </main>
    </div>
  );
}
