import { DonationVerseSection } from "@/components/public/layout/pages/donaciones/DonationVerseSection";
import { DonationAccountsDetailsSection } from "@/components/public/layout/pages/donaciones/DonationAccountsDetailsSection";
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";

export const metadata = {
  title: "Donaciones",
  description: "Apoya la misión de Alianza Puembo a través de tus diezmos y ofrendas. Tu generosidad nos permite seguir extendiendo el Reino de Dios.",
  alternates: {
    canonical: "/donaciones",
  },
};

export default function Donaciones() {
  const introSectionData = {
    title: "Apoya Nuestra Misión",
    description: "Tu generosidad es fundamental para que podamos seguir extendiendo el mensaje de esperanza y amor. Cada ofrenda y diezmo nos permite continuar con nuestra labor en la comunidad y más allá.",
    titleColor: "text-(--puembo-green)",
  };

  return (
    <PublicPageLayout
      title="Donaciones"
      description="Tu generosidad nos ayuda a seguir extendiendo el Reino de Dios."
      imageUrl="/donaciones/Donaciones.jpg"
      imageAlt="Genta adorando"
      introSectionData={introSectionData}
    >
      <DonationVerseSection />
      <DonationAccountsDetailsSection />
    </PublicPageLayout>
  );
}