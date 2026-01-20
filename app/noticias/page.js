import { Suspense } from "react";
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { getNews } from "@/lib/data/news";
import { NewsClient } from "./NewsClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Noticias y Crónicas",
  description: "Descubre lo que Dios está haciendo en nuestra comunidad. Historias, testimonios y actualizaciones de Alianza Puembo.",
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
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page) || 1;
  const { paginatedNews, totalPages, hasNextPage } = await getNews(page);

  const introSectionData = {
    title: "Crónicas de Nuestra Familia",
    description: [
      "Esta no es solo una sección de anuncios; es un diario de la fidelidad de Dios. Aquí compartimos los frutos de los ministerios, los testimonios de transformación y el impacto de nuestra comunidad en Puembo y el mundo.",
      "Te invitamos a recorrer estas historias y celebrar con nosotros cada paso que damos como una familia de familias.",
    ],
    imageUrl: "/noticias/news-intro.jpg",
    imageAlt: "Comunidad compartiendo",
    imagePosition: "left",
  };

  return (
    <PublicPageLayout
      title="Noticias"
      description="Historias que inspiran y nos mantienen unidos."
      imageUrl="/noticias/Noticias.jpg"
      imageAlt="Personas compartiendo"
      introSectionData={page === 1 ? introSectionData : undefined}
    >
      <Suspense fallback={<LoadingState />}>
        <NewsClient 
          news={paginatedNews}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
          page={page}
        />
      </Suspense>
    </PublicPageLayout>
  );
}
