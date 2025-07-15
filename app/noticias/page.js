import { NewsIntroSection } from "@/components/public/layout/pages/noticias/NewsIntroSection";
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
  return (
    <PublicPageLayout
      title="Noticias"
      description="Mantente informado sobre los últimos acontecimientos de nuestra iglesia."
      imageUrl="/noticias/Noticias.jpg"
      imageAlt="Personas compartiendo"
    >
      <NewsIntroSection />
      <NewsContentSection />
    </PublicPageLayout>
  );
}
