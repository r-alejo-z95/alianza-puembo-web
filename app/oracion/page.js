import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { PrayerWallIntroSection } from "@/components/public/layout/pages/oracion/PrayerWallIntroSection";
import { PrayerRequestSection } from "@/components/public/layout/pages/oracion/PrayerRequestSection";
import { PageHeader } from "@/components/public/layout/pages/PageHeader";

export const metadata = {
  title: "Muro de Oración",
  description: "Comparte tus peticiones de oración y únete a nosotros para orar por las necesidades de otros. Un espacio de fe y apoyo mutuo.",
  alternates: {
    canonical: "/oracion",
  },
};

async function getPublicPrayerRequests() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data, error } = await supabase
    .from('prayer_requests')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching prayer requests:', error);
    return [];
  }
  return data;
}

export default async function OracionPage() {
  const requests = await getPublicPrayerRequests();

  return (
    <>
      <PageHeader
        title="Muro de Oración"
        description="Unámonos en oración. Aquí puedes compartir tus peticiones y orar por las de otros."
        imageUrl="/oracion/Oracion.jpg"
        imageAlt="Personas orando"
      />

      <PrayerWallIntroSection />
      <PrayerRequestSection requests={requests} />
    </>
  );
}