import EventManager from '@/components/admin/managers/EventManager';
import { AdminCalendar } from '@/components/shared/CalendarOrigin';
import { EventsProvider } from '@/components/providers/EventsProvider';
import { adminPageSection, adminPageHeaderContainer, adminPageTitle, adminPageDescription } from "@/lib/styles.ts";

export const metadata = {
  title: "Gestionar Eventos",
  description: "Administra los eventos de la iglesia: crea, edita y elimina eventos.",
  robots: {
    index: false,
    follow: false
  },
};

export default function EventosPage() {
  return (
    <EventsProvider>
      <section className={adminPageSection}>
        <div className={adminPageHeaderContainer}>
          <h1 className={adminPageTitle}>
            Gestionar Eventos
          </h1>
          <p className={adminPageDescription}>
            Administra los eventos de la iglesia desde el calendario o la tabla.
          </p>
        </div>
        <EventManager />
        <AdminCalendar />
      </section>
    </EventsProvider>
  );
}