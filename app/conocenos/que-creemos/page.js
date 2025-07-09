import { QueCreemosHeader } from "@/components/public/layout/pages/que-creemos/QueCreemosHeader";
import { MissionVision } from "@/components/public/layout/pages/que-creemos/MissionVision";
import { Declaration } from "@/components/public/layout/pages/que-creemos/Declaration";
import { BeliefsSection } from "@/components/public/layout/pages/que-creemos/BeliefsSection";

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
