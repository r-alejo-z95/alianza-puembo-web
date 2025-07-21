
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/ministerios/MinistryContentSection";

export const metadata = {
  title: "Navidad Digna",
  description: "Llevando alegría y esperanza a niños y familias en Navidad a través de regalos, alimentos y un mensaje de amor.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/conexion/amor-en-accion/navidad-digna",
  },
};

export default function NavidadDigna() {
  const introSectionData = {
    title: "Navidad Digna: Compartiendo la Alegría",
    description: [
      "Navidad Digna es uno de nuestros proyectos más queridos, donde buscamos llevar la alegría y el verdadero significado de la Navidad a niños y familias en situación de vulnerabilidad. Creemos que nadie debería pasar la Navidad sin un regalo y sin sentir el amor de Dios.",
      "A través de la recolección de juguetes, ropa y alimentos, y la organización de eventos festivos, hacemos de la Navidad un tiempo de esperanza y dignidad para muchos.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/conexion/amor-en-accion/navidad-digna/NavidadDigna.jpg",
    imageAlt: "Niños recibiendo regalos de Navidad",
    imagePosition: "right",
  };

  const projectDetails = {
    title: "¿Cómo puedes participar?",
    items: [
      {
        type: "icon",
        iconType: "Gift",
        itemTitle: "Donando Juguetes",
        itemDescription: "Regala juguetes nuevos o en excelente estado para niños de todas las edades.",
      },
      {
        type: "icon",
        iconType: "Soup",
        itemTitle: "Donando Alimentos",
        itemDescription: "Contribuye con alimentos no perecederos para armar canastas navideñas.",
      },
      {
        type: "icon",
        iconType: "Users",
        itemTitle: "Voluntariado",
        itemDescription: "Ayúdanos en la organización y distribución de los regalos y alimentos.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Navidad Digna"
      description="Llevando alegría y esperanza en Navidad."
      imageUrl="/involucrate/ministerios/servicio/conexion/amor-en-accion/navidad-digna/NavidadDigna.jpg"
      imageAlt="Navidad Digna"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...projectDetails} />
    </PublicPageLayout>
  );
}
