import { SmallGroupsIntroSection } from "@/components/public/layout/pages/ministerios/gp/SmallGroupsIntroSection";
import { SmallGroupsBenefitsSection } from "@/components/public/layout/pages/ministerios/gp/SmallGroupsBenefitsSection";
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";

export const metadata = {
  title: "Grupos Pequeños",
  description: "Únete a nuestros grupos pequeños para crecer en comunidad, estudiar la Biblia y fortalecer tu fe junto a otros miembros de la iglesia.",
  alternates: {
    canonical: "/ministerios/gp",
  },
};

export default function GruposPequenos() {
  return (
    <PublicPageLayout
      title="Grupos Pequeños"
      description="Crece en comunidad y fe a través de nuestros grupos pequeños."
      imageUrl="/ministerios/gp/Gp.jpg"
      imageAlt="Grupo pequeño"
    >
      <SmallGroupsIntroSection />
      <SmallGroupsBenefitsSection />
    </PublicPageLayout>
  );
}
