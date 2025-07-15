import { PuemboKidsIntroSection } from "@/components/public/layout/pages/ministerios/puembo-kids/PuemboKidsIntroSection";
import { PuemboKidsActivitiesSection } from "@/components/public/layout/pages/ministerios/puembo-kids/PuemboKidsActivitiesSection";
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";

export const metadata = {
  title: "Puembo Kids",
  description: "Puembo Kids es nuestro ministerio para niños, un lugar lleno de diversión, seguridad y enseñanza bíblica para que los más pequeños conozcan a Jesús.",
  alternates: {
    canonical: "/ministerios/puembo-kids",
  },
};

export default function PuemboKids() {
  return (
    <PublicPageLayout
      title="Puembo Kids"
      description="Un espacio divertido y seguro para que los más pequeños aprendan de Jesús."
      imageUrl="/ministerios/puembo-kids/Puembo-kids.jpg"
      imageAlt="Celebración de Puembo Kids"
    >
      <PuemboKidsIntroSection />
      <PuemboKidsActivitiesSection />
    </PublicPageLayout>
  );
}
