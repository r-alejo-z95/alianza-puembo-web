import EventManager from "@/components/admin/managers/EventManager";
import { AdminCalendar } from "@/components/shared/CalendarOrigin";
import { EventsProvider } from "@/components/providers/EventsProvider";
import { verifyPermission } from "@/lib/auth/guards";
import {
  adminPageSection,
  adminPageHeaderContainer,
  adminPageTitle,
  adminPageDescription,
} from "@/lib/styles.ts";
import { getFinancialSummary } from "@/lib/actions/finance";
import { TrendingUp, Users, Wallet, Target } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export const metadata = {
  title: "Gestionar Eventos",
  description:
    "Administra los eventos de la iglesia: crea, edita y elimina eventos.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EventosPage() {
  await verifyPermission("perm_events");
  const { summary } = await getFinancialSummary();

  return (
    <EventsProvider>
      <section className={adminPageSection}>
        <header className={adminPageHeaderContainer}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-12 bg-[var(--puembo-green)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--puembo-green)]">
              Planificación
            </span>
          </div>
          <h1 className={adminPageTitle}>
            Gestionar{" "}
            <span className="text-[var(--puembo-green)] italic">Eventos</span>
          </h1>
          <p className={adminPageDescription}>
            Organiza, agenda y publica las actividades que fortalecen nuestra
            comunidad. Gestiona desde la tabla o visualiza en el calendario.
          </p>
        </header>

        {/* FINANCIAL SUMMARY WIDGET */}
        {summary && summary.length > 0 && (
          <div className="mb-16 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-[var(--puembo-green)]" />
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">Estado de Inscripciones</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {summary.map((item) => (
                <div 
                  key={item.eventId}
                  className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group border border-white/5"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
                    <Target className="w-24 h-24" />
                  </div>

                  <div className="relative space-y-6">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[var(--puembo-green)]">
                        {format(parseISO(item.startTime), "d 'de' MMMM", { locale: es })}
                      </span>
                      <h3 className="text-xl font-serif font-bold leading-tight truncate pr-12">
                        {item.eventTitle}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 block mb-1">Inscritos</span>
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xl font-bold">{item.totalInscribed}</span>
                        </div>
                      </div>
                      <div className="bg-[var(--puembo-green)]/10 rounded-2xl p-4 border border-[var(--puembo-green)]/10">
                        <span className="text-[8px] font-black uppercase tracking-widest text-[var(--puembo-green)] block mb-1">Conciliado</span>
                        <div className="flex items-center gap-2">
                          <Wallet className="w-3.5 h-3.5 text-[var(--puembo-green)]" />
                          <span className="text-xl font-black font-serif">${item.verifiedAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <EventManager />

        <div className="pt-24 space-y-12">
          <div className="flex items-center gap-6 px-4">
            <h2 className="text-3xl font-serif font-bold text-gray-900 whitespace-nowrap">
              Vista de Calendario
            </h2>
            <div className="h-px bg-gray-200 grow" />
          </div>
          <AdminCalendar />
        </div>
      </section>
    </EventsProvider>
  );
}