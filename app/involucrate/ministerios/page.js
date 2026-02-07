import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryMap } from "@/components/public/layout/pages/involucrate/ministerios/MinistryMap";
import { menuItems } from "@/components/public/layout/navbar/config";

export const metadata = {
  title: "Ministerios",
  description: "Explora los ministerios de Alianza Puembo, diseñados para cada etapa de tu vida espiritual. Encuentra tu lugar en nuestras áreas de Cuidado y Servicio.",
  alternates: {
    canonical: "/involucrate/ministerios",
  },
};

export default function Ministerios() {
  const introSectionData = {
    title: "Encuentra tu Lugar para Crecer y Servir",
    description: [
      "En Alianza Puembo, creemos que cada persona tiene un propósito único en el cuerpo de Cristo. Nuestros ministerios están diseñados para cuidarte, equiparte y darte oportunidades para que uses tus dones al servicio de Dios y de los demás.",
      "A continuación, encontrarás nuestro mapa ministerial completo. Haz clic directamente en cualquier área o ministerio para conocer más detalles e involucrarte hoy mismo.",
    ],
    imageUrl: "/involucrate/ministerios/Ministerios.avif",
    imageAlt: "Personas sirviendo en la comunidad",
    imagePosition: "right",
  };

  return (
    <PublicPageLayout
      title="Ministerios"
      description="Descubre los ministerios de Alianza Puembo."
      imageUrl="/involucrate/ministerios/header.avif"
      imageAlt="Ministerios de Alianza Puembo"
      introSectionData={introSectionData}
    >
      <MinistryMap menuItems={menuItems} />
    </PublicPageLayout>
  );
}