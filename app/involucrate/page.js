import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";

export const metadata = {
  title: "Involúcrate",
  description: "Descubre cómo puedes ser parte activa de la Iglesia Alianza Puembo a través de nuestra Ruta de la Fe y los Ministerios.",
  alternates: {
    canonical: "/involucrate",
  },
};

export default function InvolucrateRaiz() {
  const portalData = {
    title: "Tus Siguientes Pasos",
    items: [
      {
        type: "image",
        imageUrl: "/involucrate/ruta.avif",
        href: "/involucrate/ruta",
        itemTitle: "Nuestra Ruta",
        itemDescription: "El camino diseñado para conocer nuestra familia, crecer en fe y encontrar tu propósito.",
      },
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/header.avif",
        href: "/involucrate/ministerios",
        itemTitle: "Ministerios",
        itemDescription: "Encuentra tu lugar para crecer y servir en nuestras áreas de Cuidado y Servicio.",
      },
    ],
  };

  const introSectionData = {
    title: "Hay un Lugar para Ti",
    description: [
      "No fuimos creados para caminar solos. En Alianza Puembo, queremos ayudarte a encontrar tu lugar en esta familia, donde puedas ser cuidado y también usar tus dones para bendecir a otros.",
      "Ya sea que estés dando tus primeros pasos en la fe o busques un lugar para servir, aquí encontrarás una comunidad lista para caminar junto a ti.",
    ],
    imageUrl: "/involucrate/ruta.avif",
    imageAlt: "Personas involucrándose",
    imagePosition: "right",
  };

  return (
    <PublicPageLayout
      title="Involúcrate"
      description="Sé parte de lo que Dios está haciendo."
      imageUrl="/involucrate/ruta.avif"
      imageAlt="Involúcrate"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...portalData} />
    </PublicPageLayout>
  );
}
