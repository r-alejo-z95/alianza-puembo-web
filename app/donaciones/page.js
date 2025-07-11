import { PageHeader } from "@/components/public/layout/pages/PageHeader";
import { DonationVerseSection } from "@/components/public/layout/pages/donaciones/DonationVerseSection";
import { DonationAccountsDetailsSection } from "@/components/public/layout/pages/donaciones/DonationAccountsDetailsSection";
import { DonationIntroSection } from "@/components/public/layout/pages/donaciones/DonationIntroSection";

export const metadata = {
  title: "Donaciones",
  description: "Apoya la misión de Alianza Puembo a través de tus diezmos y ofrendas. Tu generosidad nos permite seguir extendiendo el Reino de Dios.",
  alternates: {
    canonical: "/donaciones",
  },
};

export default function Donaciones() {
  return (
    <main>
      <PageHeader
        title="Donaciones"
        description="Tu generosidad nos ayuda a seguir extendiendo el Reino de Dios."
        imageUrl="/donaciones/Donaciones.jpg"
        imageAlt="Genta adorando"
      />
      <DonationIntroSection />
      <DonationVerseSection />
      <DonationAccountsDetailsSection />
    </main>
  );
}