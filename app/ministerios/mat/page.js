import { MatIntroSection } from "@/components/public/layout/pages/ministerios/mat/MatIntroSection";
import { MatActivitiesSection } from "@/components/public/layout/pages/ministerios/mat/MatActivitiesSection";
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";

export const metadata = {
  title: "Ministerio de Música, Artes y Tecnología",
  description: "Un ministerio dedicado a la adoración y el servicio a través de la música y las artes.",
  alternates: {
    canonical: "/ministerios/mat",
  },
};

export default function Mat() {
  return (
    <PublicPageLayout
      title="Ministerio de Música, Artes y Tecnología"
      description="Un ministerio dedicado a la adoración y el servicio a través de la música y las artes."
      imageUrl="/ministerios/mat/Mat.jpg"
      imageAlt="Cantantes adorando"
    >
      <MatIntroSection />
      <MatActivitiesSection />
    </PublicPageLayout>
  );
}
