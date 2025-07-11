import { QueCreemosHeader } from "@/components/public/layout/pages/que-creemos/QueCreemosHeader";
import { MissionVision } from "@/components/public/layout/pages/que-creemos/MissionVision";
import { Declaration } from "@/components/public/layout/pages/que-creemos/Declaration";
import { BeliefsSection } from "@/components/public/layout/pages/que-creemos/BeliefsSection";

export const metadata = {
  title: "Qué Creemos",
  description: "Nuestra declaración de fe, misión y visión. Conoce los fundamentos bíblicos y las doctrinas centrales de la Alianza Cristiana y Misionera.",
  alternates: {
    canonical: "/conocenos/que-creemos",
  },
};

export default function QueCreemosPage() {
  return (
    <main>
      <QueCreemosHeader />
      <MissionVision />
      <Declaration />
      <BeliefsSection />
    </main>
  );
}
