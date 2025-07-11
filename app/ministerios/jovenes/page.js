import { contentSection } from "@/lib/styles";
import { PageHeader } from "@/components/public/layout/pages/PageHeader";

export const metadata = {
  title: "Ministerio de Jóvenes",
  description: "Descubre un espacio dinámico para jóvenes donde pueden crecer en su fe, construir amistades sólidas y encontrar su propósito en Cristo.",
  alternates: {
    canonical: "/ministerios/jovenes",
  },
};

export default function Jovenes() {
  return (
    <section>
      <PageHeader
        title="Ministerio de Jóvenes"
        description="Un espacio para crecer en fe, amistad y propósito."
        imageUrl="/ministerios/jovenes/Jovenes.jpg"
        imageAlt="Jóvenes en un campamento"
      />
      <div className={contentSection}>
        {/* Contenido del ministerio de jóvenes */}
      </div>
    </section>
  );
}
