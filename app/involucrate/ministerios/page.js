import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";

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
      "Te invitamos a explorar nuestras dos grandes áreas de ministerio: Cuidado y Servicio. Descubre cómo puedes conectarte, crecer en tu fe y hacer una diferencia.",
    ],
    imageUrl: "/involucrate/ministerios/Ministerios.jpg",
    imageAlt: "Personas sirviendo en la comunidad",
    imagePosition: "right",
  };

  const ministriesData = {
    title: "Nuestras Áreas de Ministerio",
    items: [
      {
        type: "link",
        href: "/involucrate/ministerios/cuidado",
        itemTitle: "Cuidado",
        itemDescription: "Ministerios enfocados en el cuidado pastoral, la consejería y el apoyo a las familias en cada etapa de la vida.",
      },
      {
        type: "link",
        href: "/involucrate/ministerios/servicio",
        itemTitle: "Servicio",
        itemDescription: "Oportunidades para servir a la iglesia y a la comunidad, utilizando tus dones y talentos para el Reino de Dios.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Ministerios"
      description="Descubre los ministerios de Alianza Puembo."
      imageUrl="/involucrate/ministerios/Ministerios.jpg"
      imageAlt="Ministerios de Alianza Puembo"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...ministriesData} />
    </PublicPageLayout>
  );
}