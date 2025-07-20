
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/ministerios/MinistryContentSection";

export const metadata = {
  title: "Visitación y Funerales",
  description: "Brindando apoyo, consuelo y presencia pastoral a familias en momentos de enfermedad, duelo o necesidad en Alianza Puembo.",
  alternates: {
    canonical: "/ministerios/servicio/compromiso/mda/visitacion-y-funerales",
  },
};

export default function VisitacionYFunerales() {
  const introSectionData = {
    title: "Visitación y Funerales: Acompañando en Todo Momento",
    description: [
      "El ministerio de Visitación y Funerales extiende el amor y la compasión de Cristo a aquellos que atraviesan momentos difíciles, como enfermedades, hospitalizaciones, duelos o cualquier otra necesidad. Creemos en la importancia de la presencia pastoral y el consuelo en tiempos de vulnerabilidad.",
      "Nuestro equipo está dedicado a visitar, orar y brindar apoyo práctico y emocional a las familias de nuestra comunidad, siendo un reflejo del cuidado de Dios.",
    ],
    imageUrl: "/ministerios/servicio/compromiso/mda/visitacion-y-funerales/VisitacionYFunerales.jpg",
    imageAlt: "Pastor orando con una familia en un hospital",
    imagePosition: "right",
  };

  const roles = {
    title: "Nuestra Labor",
    items: [
      {
        type: "icon",
        iconType: "Hospital",
        itemTitle: "Visitas Hospitalarias",
        itemDescription: "Acompañamiento y oración por los enfermos y sus familias en hospitales.",
      },
      {
        type: "icon",
        iconType: "HeartCrack",
        itemTitle: "Apoyo en Duelo",
        itemDescription: "Presencia y consuelo en funerales y momentos de pérdida.",
      },
      {
        type: "icon",
        iconType: "Home",
        itemTitle: "Visitación Domiciliaria",
        itemDescription: "Visitas a hogares para orar, animar y atender necesidades específicas.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Visitación y Funerales"
      description="Acompañando en momentos de necesidad y duelo."
      imageUrl="/ministerios/servicio/compromiso/mda/visitacion-y-funerales/VisitacionYFunerales.jpg"
      imageAlt="Visitación y Funerales"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...roles} />
    </PublicPageLayout>
  );
}
