import { getLomPosts } from "@/lib/data/client/lom";
import { getThisWeekPassages } from "@/lib/data/client/passages";
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { getNowInEcuador, formatEcuadorDateForInput } from "@/lib/date-utils";
import { LomClient } from "./LomClient";

export const metadata = {
  title: "Lee, Ora, Medita",
  description: "Profundiza en la lectura y meditación de la Biblia con nuestros devocionales diarios.",
  alternates: {
    canonical: "/recursos/lom",
  },
};

export default async function LomPage() {
  // Nota: Estas funciones de 'client' en realidad funcionan en server si se llaman en un Server Component
  // ya que usan el cliente de Supabase estándar.
  const [lomPosts, weeklyPassages] = await Promise.all([
    getLomPosts(),
    getThisWeekPassages(),
  ]);

    // Filtrar posts publicados hasta hoy

    const today = formatEcuadorDateForInput(getNowInEcuador());

    const publishedPosts = lomPosts.filter(

      (post) => formatEcuadorDateForInput(post.publication_date) <= today

    );

  

  // Ordenar pasajes semanales por día de la semana (creando una copia para evitar mutar el original)
  const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const sortedPassages = [...weeklyPassages].sort((a, b) => {
    return (
      daysOfWeek.indexOf(a.day_of_week?.trim()) - daysOfWeek.indexOf(b.day_of_week?.trim())
    );
  });

  

    return (

      <PublicPageLayout

        title="Devocionales LOM"

        description="Un espacio diario para encontrarte con Dios a través de Su Palabra."

        imageUrl="/recursos/lom/Lom.png"

        imageAlt="Nubes en el cielo con luz del sol"

      >

        <LomClient initialPosts={publishedPosts} initialPassages={sortedPassages} />

      </PublicPageLayout>

    );

  }

  