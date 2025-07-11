import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PrayerRequestForm from '@/components/public/forms/PrayerRequestForm';
import { addPrayerRequest } from '@/app/oracion/actions';
import { cn } from "@/lib/utils";
import { contentSection, sectionTitle, sectionText } from "@/lib/styles";

export function PrayerRequestsSection({ requests }) {
  return (
    <section className={cn(contentSection, "bg-gray-100 py-16 md:py-24")}>
      <h2 className={cn(sectionTitle, "text-center mb-12")}>
        Peticiones de Oración
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12 max-w-6xl mx-auto">
        {requests.map((req) => (
          <Card key={req.id} className="shadow-lg">
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

      <div className="flex flex-col items-center max-w-xl mx-auto">
        <h2 className={cn(sectionTitle, "text-center mb-8")}>
          Envía tu Petición
        </h2>
        <PrayerRequestForm action={addPrayerRequest} />
      </div>
    </section>
  );
}