import { contentSection } from "@/lib/styles";
import { PageHeader } from "@/components/public/layout/pages/PageHeader";

export const metadata = {
  title: "Ministerio de Música, Artes y Tecnología",
  description: "Un ministerio dedicado a la adoración y el servicio a través de la música y las artes.",
  alternates: {
    canonical: "/ministerios/mat",
  },
};

export default function Mat() {
  return (
    <section>
      <PageHeader
        title="Ministerio de Música, Artes y Tecnología"
        description="Un ministerio dedicado a la adoración y el servicio a través de la música y las artes."
        imageUrl="/ministerios/mat/Mat.jpg"
        imageAlt="Cantantes adorando"
      />
      <div className={contentSection}>
        {/* Contenido del ministerio MAT */}
      </div>
    </section>
  );
}
