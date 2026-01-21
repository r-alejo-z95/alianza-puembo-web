
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";

export const metadata = {
  title: "Miércoles de Oración",
  description: "Únete a nuestra comunidad cada miércoles a las 06h30 para un tiempo sagrado de búsqueda de Dios, adoración y clamor unida.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/compromiso/oracion/miercoles-de-oracion",
  },
};

export default function MiercolesDeOracion() {
  const introSectionData = {
    title: "Miércoles de Oración: Un Tiempo Sagrado",
    description: [
      "Creemos en el poder de comenzar el día buscando el rostro de Dios. Cada miércoles a las 06h30, nos reunimos como familia para adorar, estudiar Su Palabra y levantar nuestras voces en un clamor unido por nuestra comunidad y necesidades personales.",
      "Es el motor espiritual que nos sostiene y nos prepara para caminar en Su voluntad durante el resto de la semana.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/compromiso/oracion/miercoles-de-oracion/MiercolesDeOracion.jpg",
    imageAlt: "Miércoles de Oración",
    imagePosition: "right",
  };

  const serviceDetailsData = {
    title: "Detalles del Encuentro",
    items: [
      {
        type: "icon",
        iconType: "Clock",
        itemTitle: "Horario: 06h30",
        itemDescription: "Consagramos la primera hora de nuestro miércoles para encontrarnos con el Señor.",
      },
      {
        type: "icon",
        iconType: "Mic",
        itemTitle: "Adoración y Palabra",
        itemDescription: "Un tiempo dedicado a la alabanza y la reflexión en las Escrituras.",
      },
      {
        type: "icon",
        iconType: "HandHeart",
        itemTitle: "Clamor Unido",
        itemDescription: "Oramos juntos por las familias, la iglesia y nuestra nación.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Miércoles de Oración"
      description="Cada miércoles a las 06h30."
      imageUrl="/involucrate/ministerios/servicio/compromiso/oracion/miercoles-de-oracion/MiercolesDeOracion.jpg"
      imageAlt="Miércoles de Oración"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...serviceDetailsData} />
    </PublicPageLayout>
  );
}
