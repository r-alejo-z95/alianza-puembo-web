import { contentSection } from "@/lib/styles";
import { PageHeader } from "@/components/public/layout/pages/PageHeader";

export const metadata = {
  title: "Grupos Pequeños",
  description: "Únete a nuestros grupos pequeños para crecer en comunidad, estudiar la Biblia y fortalecer tu fe junto a otros miembros de la iglesia.",
  alternates: {
    canonical: "/ministerios/gp",
  },
};

export default function GruposPequenos() {
  return (
    <section>
      <PageHeader
        title="Grupos Pequeños"
        description="Crece en comunidad y fe a través de nuestros grupos pequeños."
        imageUrl="/ministerios/gp/gp.jpg"
        imageAlt="Grupo pequeño"
      />
      <div className={contentSection}>
        {/* Contenido de grupos pequeños */}
      </div>
    </section>
  );
}
