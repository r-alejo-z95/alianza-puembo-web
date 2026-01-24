import EventManager from "@/components/admin/managers/EventManager";
import { AdminCalendar } from "@/components/shared/CalendarOrigin";
import { EventsProvider } from "@/components/providers/EventsProvider";
import {
  adminPageSection,
  adminPageHeaderContainer,
  adminPageTitle,
  adminPageDescription,
} from "@/lib/styles.ts";

export const metadata = {
  title: "Gestionar Eventos",
  description:
    "Administra los eventos de la iglesia: crea, edita y elimina eventos.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EventosPage() {
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
