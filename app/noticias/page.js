import { Suspense } from "react";
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { getAllNews } from "@/lib/data/news";
import { NewsClient } from "./NewsClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Noticias y Crónicas",
  description:
    "Descubre lo que Dios está haciendo en nuestra comunidad. Historias, testimonios y actualizaciones de Alianza Puembo.",
  alternates: {
    canonical: "/noticias",
  },
};

function LoadingState() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
    </div>
  );
}

export default async function Noticias({ searchParams }) {
  const params = await searchParams;
  const page = parseInt(params.page) || 1;
  const news = await getAllNews();

  const introSectionData = {
    title: "Crónicas de Nuestra Familia",
    description: [
      "Esta no es solo una sección de anuncios; es un diario de la fidelidad de Dios. Aquí compartimos los frutos de los ministerios, los testimonios de transformación y el impacto de nuestra comunidad en Puembo y el mundo.",
    ],
  };

  return (
    <PublicPageLayout
      title="Noticias"
      description="Historias que inspiran y nos mantienen unidos."
      imageUrl="/noticias/Noticias.avif"
      imageAlt="Personas compartiendo"
      introSectionData={introSectionData}
    >
      <Suspense fallback={<LoadingState />}>
        <NewsClient news={news} />
      </Suspense>
    </PublicPageLayout>
  );
}
