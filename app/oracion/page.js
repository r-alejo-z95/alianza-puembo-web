import { createServerSupabaseClient } from '@/lib/supabase/server';
import PrayerRequestForm from '@/components/PrayerRequestForm';
import { addPrayerRequest } from './actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

async function getPublicPrayerRequests() {
  const supabase = await createServerSupabaseClient();
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
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight font-merriweather">Muro de Oración</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Unámonos en oración. Aquí puedes compartir tus peticiones y orar por las de otros.
        </p>
      </div>

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
    </section>
  );
}