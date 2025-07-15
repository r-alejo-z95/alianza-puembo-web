import { PrayerWallIntroSection } from "@/components/public/layout/pages/oracion/PrayerWallIntroSection";
import { PrayerRequestSection } from "@/components/public/layout/pages/oracion/PrayerRequestSection";
import { getPublicPrayerRequests } from '@/lib/data/prayer';
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";

export const metadata = {
  title: "Muro de Oración",
  description: "Comparte tus peticiones de oración y únete a nosotros para orar por las necesidades de otros. Un espacio de fe y apoyo mutuo.",
  alternates: {
    canonical: "/oracion",
  },
};

export default async function OracionPage() {
  const requests = await getPublicPrayerRequests();

  return (
    <PublicPageLayout
      title="Muro de Oración"
      description="Unámonos en oración. Aquí puedes compartir tus peticiones y orar por las de otros."
      imageUrl="/oracion/Oracion.jpg"
      imageAlt="Personas orando"
    >
      <PrayerWallIntroSection />
      <PrayerRequestSection requests={requests} />
    </PublicPageLayout>
  );
}