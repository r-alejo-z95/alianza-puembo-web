import { PageHeader } from "@/components/public/layout/pages/PageHeader";
import { NewsIntroSection } from "@/components/public/layout/pages/noticias/NewsIntroSection";
import { NewsContentSection } from "@/components/public/layout/pages/noticias/NewsContentSection";

export const metadata = {
  title: "Noticias",
  description: "Mantente al día con las últimas noticias, anuncios y eventos importantes de Alianza Puembo. ¡No te pierdas nada!",
  alternates: {
    canonical: "/noticias",
  },
};

export default function Noticias() {
  return (
    <main>
      <PageHeader
        title="Noticias"
        description="Mantente informado sobre los últimos acontecimientos de nuestra iglesia."
        imageUrl="/noticias/Noticias.jpg"
        imageAlt="Personas compartiendo"
      />
      <NewsIntroSection />
      <NewsContentSection />
    </main>
  );
}
