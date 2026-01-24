"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Newspaper,
  BookOpen,
  HandHelping,
  FileText,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils.ts";

const navLinks = [
  {
    href: "/admin/eventos",
    label: "Eventos",
    icon: Calendar,
  },
  {
    href: "/admin/noticias",
    label: "Noticias",
    icon: Newspaper,
  },
  {
    href: "/admin/lom",
    label: "LOM",
    icon: BookOpen,
  },
  {
    href: "/admin/oracion",
    label: "Oración",
    icon: HandHelping,
  },
  {
    href: "/admin/formularios",
    label: "Forms",
    icon: FileText,
  },
  {
    href: "/admin/preferencias",
    label: "Perfil",
    icon: UserCircle,
  },
];

export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-black/95 backdrop-blur-xl border-t border-white/10 px-1 py-2 md:hidden">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 transition-all duration-300",
                isActive ? "text-[var(--puembo-green)]" : "text-gray-500",
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-xl transition-colors duration-300",
                  isActive ? "bg-[var(--puembo-green)]/10" : "bg-transparent",
                )}
              >
                <link.icon className={cn("h-4 w-4", isActive && "scale-110")} />
              </div>
              <span
                className={cn(
                  "text-[8px] font-black uppercase tracking-tighter truncate w-full text-center px-0.5",
                  isActive ? "opacity-100" : "opacity-50",
                )}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
