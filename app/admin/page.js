import { getSessionUser } from "@/lib/auth/getSessionUser";
import { 
  adminPageSection, 
  adminPageHeaderContainer, 
  adminPageTitle, 
  adminPageDescription 
} from "@/lib/styles.ts";
import Link from "next/link";
import { 
  Calendar, 
  Newspaper, 
  BookOpen, 
  Users, 
  FileText,
  ArrowRight,
  ShieldAlert,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils.ts";

export const metadata = {
  title: "Dashboard",
  description: "Panel de administración de Alianza Puembo.",
  robots: { 
    index: false, 
    follow: false 
  },
};

const quickActions = [
  { href: "/admin/eventos", label: "Eventos", icon: Calendar, description: "Organiza y publica las próximas actividades de la iglesia.", color: "bg-blue-500", permission: "perm_events" },
  { href: "/admin/noticias", label: "Noticias", icon: Newspaper, description: "Comparte historias y crónicas de lo que Dios está haciendo.", color: "bg-emerald-500", permission: "perm_news" },
  { href: "/admin/lom", label: "LOM", icon: BookOpen, description: "Gestiona los devocionales diarios de Lee, Ora, Medita.", color: "bg-amber-500", permission: "perm_lom" },
  { href: "/admin/comunidad", label: "Comunidad", icon: Users, description: "Atiende los mensajes de contacto y modera las peticiones de oración.", color: "bg-purple-500", permission: "perm_comunidad" },
  { href: "/admin/formularios", label: "Formularios", icon: FileText, description: "Crea y gestiona formularios de registro dinámicos.", color: "bg-rose-500", permission: "perm_forms" },
  { href: "/admin/staff", label: "Staff & Procesos", icon: ClipboardList, description: "Gestión de requerimientos y procesos operativos internos.", color: "bg-indigo-500", permission: "perm_internal_forms" },
];

export default async function AdminHomePage({ searchParams }) {
  const user = await getSessionUser();
  const params = await searchParams;
  const hasError = params?.error === "no_permission";
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';

  // Filtrar acciones rápidas
  const filteredActions = quickActions.filter(action => {
    if (user?.is_super_admin) return true;
    return user?.permissions?.[action.permission];
  });

  return (
    <section className={adminPageSection}>
      {hasError && (
        <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
          <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-red-900 uppercase tracking-tight">Acceso Denegado</h4>
            <p className="text-xs text-red-600/70 font-medium">No tienes los permisos necesarios para acceder a esa sección.</p>
          </div>
        </div>
      )}

      <header className={adminPageHeaderContainer}>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px w-12 bg-[var(--puembo-green)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--puembo-green)]">Panel de Control</span>
        </div>
        <h1 className={adminPageTitle}>
          Hola, <span className="text-[var(--puembo-green)] italic">{userName}</span>
        </h1>
        <p className={adminPageDescription}>
          Bienvenido a tu centro de gestión. Desde aquí tienes el control total sobre el contenido narrativo y funcional de Alianza Puembo.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredActions.map((action) => (
          <Link 
            key={action.href} 
            href={action.href}
            className="group relative bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:border-[var(--puembo-green)]/20 hover:-translate-y-1 overflow-hidden"
          >
            <div className={cn("absolute -right-4 -top-4 w-24 h-24 opacity-5 rounded-full transition-transform duration-700 group-hover:scale-150", action.color)} />
            <div className="relative space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[var(--puembo-green)] group-hover:text-white transition-all duration-500">
                <action.icon className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors">{action.label}</h3>
                <p className="text-gray-500 font-light leading-relaxed text-sm">{action.description}</p>
              </div>
              <div className="pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-[var(--puembo-green)] transition-colors">
                <span>Gestionar</span>
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <footer className="pt-20 border-t border-gray-100">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 text-center">
          Alianza Puembo &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </section>
  );
}