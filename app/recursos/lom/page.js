import { Suspense } from "react";
import { getLomPosts } from "@/lib/data/lom";
import { getLatestWeekPassages } from "@/lib/data/passages";
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { getNowInEcuador, formatEcuadorDateForInput } from "@/lib/date-utils";
import { LomClient } from "./LomClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Lee, Ora, Medita",
  description: "Profundiza en la lectura y meditación de la Biblia con nuestros devocionales diarios.",
  alternates: {
    canonical: "/recursos/lom",
  },
};

function LoadingState() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
    </div>
  );
}

export default async function LomPage() {
  const [lomPosts, weeklyPassages] = await Promise.all([
    getLomPosts(),
    getLatestWeekPassages(),
  ]);

  // Obtenemos la fecha actual en Ecuador (YYYY-MM-DD)
  const today = formatEcuadorDateForInput(getNowInEcuador());

  // Filtramos los posts: la fecha de publicación debe ser menor o igual a hoy en Ecuador
  const publishedPosts = lomPosts.filter((post) => {
    // El campo publication_date es tipo DATE (sin hora), por lo que viene como "YYYY-MM-DD"
    // Aseguramos que se compare correctamente con el "today" de Ecuador
    return post.publication_date <= today;
  });

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
      <Suspense fallback={<LoadingState />}>
        <LomClient
          initialPosts={publishedPosts}
          initialPassages={sortedPassages}
        />
      </Suspense>
    </PublicPageLayout>
  );
}
