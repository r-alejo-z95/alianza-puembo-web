import { contentSection } from "@/lib/styles";
import { PageHeader } from "@/components/public/layout/pages/PageHeader";
import { notAvailableText } from "@/lib/styles";

export const metadata = {
  title: "Noticias",
  description: "Mantente al día con las últimas noticias, anuncios y eventos importantes de Alianza Puembo. ¡No te pierdas nada!",
  alternates: {
    canonical: "/noticias",
  },
};

export default function Noticias() {
  return (
    <section>
      <PageHeader
        title="Noticias"
        description="Mantente informado sobre los últimos acontecimientos de nuestra iglesia."
        imageUrl="/noticias/Noticias.jpg"
        imageAlt="Personas compartiendo"
      />
      <div className={contentSection}>
        {/* Contenido de noticias */}
        <p className={notAvailableText}>No hay noticias para mostrar.</p>
      </div>
    </section>
  );
}
