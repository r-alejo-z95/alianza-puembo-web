import { MissionVision } from "@/components/public/layout/pages/que-creemos/MissionVision";
import { Declaration } from "@/components/public/layout/pages/que-creemos/Declaration";
import { BeliefsSection } from "@/components/public/layout/pages/que-creemos/BeliefsSection";
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";

export const metadata = {
  title: "Qué Creemos",
  description: "Nuestra declaración de fe, misión y visión. Conoce los fundamentos bíblicos y las doctrinas centrales de la Alianza Cristiana y Misionera.",
  alternates: {
    canonical: "/conocenos/que-creemos",
  },
};

export default function QueCreemosPage() {
  return (
    <PublicPageLayout
      title="Nuestra Fe y Valores"
      description="Somos una familia de fe, unidos por lo que creemos y la misión que Dios nos ha encomendado."
      imageUrl="/conocenos/que-creemos/Que-creemos.webp"
      imageAlt="Silueta de manos levantadas en adoración"
    >
      <MissionVision />
      <Declaration />
      <BeliefsSection />
    </PublicPageLayout>
  );
}
