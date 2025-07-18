import { NewsContentSection } from "@/components/public/layout/pages/noticias/NewsContentSection";
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";

export const metadata = {
  title: "Noticias",
  description: "Mantente al día con las últimas noticias, anuncios y eventos importantes de Alianza Puembo. ¡No te pierdas nada!",
  alternates: {
    canonical: "/noticias",
  },
};

export default function Noticias() {
  const introSectionData = {
    title: "Mantente Informado",
    description: [
      "Aquí encontrarás las últimas noticias, anuncios importantes y eventos destacados de Alianza Puembo. Nuestro objetivo es mantenerte conectado con todo lo que sucede en nuestra comunidad de fe.",
      "Desde testimonios inspiradores hasta actualizaciones de proyectos y oportunidades de servicio, esta sección es tu fuente principal para estar al día. ¡No te pierdas nada!",
    ],
    imageUrl: "/noticias/news-intro.jpg",
    imageAlt: "Chica tomando fotos",
    imagePosition: "left",
  };

  return (
    <PublicPageLayout
      title="Noticias"
      description="Mantente informado sobre los últimos acontecimientos de nuestra iglesia."
      imageUrl="/noticias/Noticias.jpg"
      imageAlt="Personas compartiendo"
      introSectionData={introSectionData}
    >
      <NewsContentSection />
    </PublicPageLayout>
  );
}
