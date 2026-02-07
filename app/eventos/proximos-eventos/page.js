import { Suspense } from "react";
import { getAllUpcomingEvents } from "@/lib/data/events";
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { UpcomingEventsClient } from "./UpcomingEventsClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Próximos Eventos",
  description:
    "Mantente al tanto de los próximos eventos y actividades especiales en Alianza Puembo. ¡No te pierdas nada!",
  alternates: {
    canonical: "/eventos/proximos-eventos",
  },
};

function LoadingState() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
    </div>
  );
}

export default async function ProximosEventos() {
  const events = await getAllUpcomingEvents();

  const introSectionData = {
    title: "No te Pierdas Nada",
    description: [
      "Mantente al tanto de los próximos eventos y actividades especiales en Alianza Puembo. Aquí encontrarás información detallada sobre cada evento, incluyendo fechas, horarios y cómo participar.",
    ],
  };

  return (
    <PublicPageLayout
      title="Próximos Eventos"
      description="Mantente al tanto de lo que viene en nuestra comunidad."
      imageUrl="/eventos/proximos-eventos/Proximos-Eventos.avif"
      imageAlt="Personas en un evento de la iglesia"
      introSectionData={introSectionData}
    >
      <Suspense fallback={<LoadingState />}>
        <UpcomingEventsClient initialEvents={events} />
      </Suspense>
    </PublicPageLayout>
  );
}
