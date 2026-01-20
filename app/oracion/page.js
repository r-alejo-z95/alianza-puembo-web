import { Suspense } from "react";
import { getPublicPrayerRequests } from '@/lib/data/prayer.ts';
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { OracionClient } from "./OracionClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Muro de Oración",
  description: "Comparte tus peticiones de oración y únete a nosotros para orar por las necesidades de otros. Un espacio de fe y apoyo mutuo.",
  alternates: {
    canonical: "/oracion",
  },
};

function LoadingState() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
    </div>
  );
}

export default async function OracionPage() {
  const requests = await getPublicPrayerRequests();

  const introSectionData = {
    title: "Unidos en Oración",
    description: "En nuestro Muro de Oración, puedes compartir tus peticiones y unirte a la comunidad en oración. Cada petición es una oportunidad para fortalecer nuestra fe y apoyarnos mutuamente. Te invitamos a participar y ser parte de este espacio sagrado.",
    titleColor: "text-[var(--puembo-green)]",
  };

  return (
    <PublicPageLayout
      title="Muro de Oración"
      description="Unámonos en oración. Aquí puedes compartir tus peticiones y orar por las de otros."
      imageUrl="/oracion/Oracion.jpg"
      imageAlt="Personas orando"
      introSectionData={introSectionData}
    >
      <Suspense fallback={<LoadingState />}>
        <OracionClient requests={requests} />
      </Suspense>
    </PublicPageLayout>
  );
}