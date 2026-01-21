import { Suspense } from "react";
import { getLomPosts } from "@/lib/data/lom";
import { getLatestWeekPassages } from "@/lib/data/passages";
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { LomClient } from "./LomClient";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lee, Ora, Medita",
  description:
    "Profundiza en la lectura y meditación de la Biblia con nuestros devocionales diarios.",
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

  const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const sortedPassages = [...weeklyPassages].sort((a, b) => {
    return (
      daysOfWeek.indexOf(a.day_of_week?.trim()) -
      daysOfWeek.indexOf(b.day_of_week?.trim())
    );
  });

  return (
    <PublicPageLayout
      title="LOM: Lee, ora, medita"
      description="Guías diarias para tu devocional personal."
      imageUrl="/recursos/lom/Lom.png"
      imageAlt="Nubes en el cielo con luz del sol"
    >
      <Suspense fallback={<LoadingState />}>
        <LomClient initialPosts={lomPosts} initialPassages={sortedPassages} />
      </Suspense>
    </PublicPageLayout>
  );
}
