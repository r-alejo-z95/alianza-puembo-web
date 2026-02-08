import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";

export const metadata = {
  title: "Recursos",
  description: "Accede a prédicas, guías devocionales LOM y galerías de Alianza Puembo.",
  alternates: {
    canonical: "/recursos",
  },
};

export default function RecursosRaiz() {
  const portalData = {
    title: "Herramientas para Crecer",
    items: [
      {
        type: "image",
        imageUrl: "/recursos/lom/Lom.avif",
        href: "https://www.youtube.com/@IglesiaAlianzaPuembo/playlists",
        itemTitle: "Prédicas",
        itemDescription: "Escucha mensajes que transforman vidas a través de nuestro canal de YouTube.",
      },
      {
        type: "image",
        imageUrl: "/recursos/lom/Lom.avif",
        href: "/recursos/lom",
        itemTitle: "LOM: Lee, Ora, Medita",
        itemDescription: "Nuestra guía devocional diaria para profundizar en la Palabra.",
      },
      {
        type: "image",
        imageUrl: "/recursos/lom/Lom.avif",
        href: "https://iglesiaalianzapuembo.pixieset.com/",
        itemTitle: "Galería",
        itemDescription: "Revive los mejores momentos de nuestra familia en imágenes.",
      },
    ],
  };

  const introSectionData = {
    title: "Creciendo en Conocimiento",
    description: [
      "Queremos brindarte todas las herramientas necesarias para que tu fe siga creciendo cada día. Aquí encontrarás recursos diseñados para nutrir tu vida espiritual, desde enseñanzas bíblicas hasta guías de oración diaria.",
      "Explora nuestro contenido y permite que la Palabra de Dios siga obrando en tu corazón.",
    ],
    imageUrl: "/recursos/lom/Lom.avif",
    imageAlt: "Recursos espirituales",
    imagePosition: "right",
  };

  return (
    <PublicPageLayout
      title="Recursos"
      description="Equipándote para el caminar diario."
      imageUrl="/recursos/lom/Lom.avif"
      imageAlt="Recursos"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...portalData} />
    </PublicPageLayout>
  );
}