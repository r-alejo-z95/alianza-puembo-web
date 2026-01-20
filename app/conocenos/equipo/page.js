import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { TeamClient } from "./TeamClient";

export const metadata = {
  title: "Equipo Ministerial",
  description: "Conoce a los pastores y líderes que sirven a nuestra comunidad en Alianza Puembo. Descubre quiénes somos y nuestra misión.",
  alternates: {
    canonical: "/conocenos/equipo",
  },
};

export default function Equipo() {
  return (
    <PublicPageLayout
      title="Equipo Ministerial"
      description="Conoce al equipo que lidera nuestra Iglesia"
      imageUrl="/conocenos/equipo/Equipo.jpg"
      imageAlt="Equipo ministerial en el aniversario de la iglesia"
    >
      <TeamClient />
    </PublicPageLayout>
  );
}