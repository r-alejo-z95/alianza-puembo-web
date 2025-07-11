import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import PrayerRequestForm from '@/components/public/forms/PrayerRequestForm';
import { addPrayerRequest } from './actions';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { contentSection } from "@/lib/styles";
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
    <section>
      <PageHeader
        title="Muro de Oración"
        description="Unámonos en oración. Aquí puedes compartir tus peticiones y orar por las de otros."
        imageUrl="/oracion/Oracion.jpg"
        imageAlt="Personas orando"
      />

      <div className={contentSection}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">{req.request_text}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <span className="text-sm text-gray-500">
                  {new Date(req.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <div className="flex items-center gap-2">
                  {!req.is_anonymous && req.name && <Badge variant="outline">{req.name}</Badge>}
                  {req.is_anonymous && <Badge variant="secondary">Anónimo</Badge>}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="flex flex-col items-center">
          <PrayerRequestForm action={addPrayerRequest} />
        </div>
      </div>
    </section>
  );
}