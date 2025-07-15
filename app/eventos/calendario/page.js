import UserCalendar from '@/components/public/calendar/UserCalendar';
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
  const events = await getEventsForCalendar();

  return (
    <PublicPageLayout
      title="Calendario de Eventos"
      description="Descubre los próximos eventos de la iglesia y marca tu calendario."
      imageUrl="/eventos/Calendario.jpg"
      imageAlt="Evento en la iglesia"
    >
      <div className={contentSection}>
        <UserCalendar events={events} />
      </div>
    </PublicPageLayout>
  );
}
