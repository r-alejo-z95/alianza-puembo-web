import { contentSection } from "@/lib/styles";
import { PageHeader } from "@/components/public/layout/pages/PageHeader";

export const metadata = {
  title: "Puembo Kids",
  description: "Puembo Kids es nuestro ministerio para niños, un lugar lleno de diversión, seguridad y enseñanza bíblica para que los más pequeños conozcan a Jesús.",
  alternates: {
    canonical: "/ministerios/puembo-kids",
  },
};

export default function PuemboKids() {
  return (
    <section>
      <PageHeader
        title="Puembo Kids"
        description="Un espacio divertido y seguro para que los más pequeños aprendan de Jesús."
        imageUrl="/ministerios/puembo-kids/Puembo-kids.jpg"
        imageAlt="Celebración de Puembo Kids"
      />
      <div className={contentSection}>
        {/* Contenido de Puembo Kids */}
      </div>
    </section>
  );
}
