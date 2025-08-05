import { UserCalendar } from '@/components/shared/CalendarOrigin';
import { ClientEventsProvider } from '@/components/providers/ClientEventsProvider';
import { contentSection } from "@/lib/styles";
import { getEventsForCalendar } from '@/lib/data/events';
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";

export const metadata = {
  title: "Calendario de Eventos",
  description: "Consulta nuestro calendario para no perderte ningún evento, reunión o actividad especial en Alianza Puembo. ¡Te esperamos!",
  alternates: {
    canonical: "/eventos/calendario",
  },
};

export default async function CalendarPage() {
  // Obten los eventos en el servidor para SSR
  const initialEvents = await getEventsForCalendar();

  return (
    <PublicPageLayout
      title="Calendario de Eventos"
      description="Descubre los próximos eventos de la iglesia y marca tu calendario."
      imageUrl="/eventos/Calendario.jpg"
      imageAlt="Evento en la iglesia"
    >
      <div className={contentSection}>
        <ClientEventsProvider initialEvents={initialEvents}>
          <UserCalendar />
        </ClientEventsProvider>
      </div>
    </PublicPageLayout>
  );
}