import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "The Four",
  description: "Cuatro verdades para compartir tu fe.",
  alternates: {
    canonical:
      "/involucrate/ministerios/servicio/conexion/redes-de-amor/pescadores/the-four",
  },
};

export default function TheFourPage() {
  const introSectionData = {
    title: "The Four: Cuatro Verdades que Cambian Todo",
    description: [
      "The Four es una herramienta de evangelismo que te ayuda a compartir el mensaje del evangelio de forma positiva, creativa y comprensible. Cuatro verdades fundamentales que cualquier persona puede entender y que tienen el poder de transformar vidas.",
      "En Pescadores utilizamos The Four como nuestra herramienta principal para iniciar conversaciones espirituales y presentar a Jesús de manera auténtica y cercana.",
    ],
    imageUrl: "/the-four/The Four-02.jpg",
    imageAlt: "The Four — cuatro verdades del evangelio",
  };

  const truthsData = {
    title: "Las Cuatro Verdades",
    items: [
      {
        iconType: "Heart",
        itemTitle: "Dios me ama",
        itemDescription:
          "Dios te ama incondicionalmente. Te conoce y quiere estar cerca de ti.",
      },
      {
        iconType: "HeartCrack",
        itemTitle: "Vivo separado de Dios",
        itemDescription:
          "Por naturaleza nos alejamos de Dios, creando una separación que afecta nuestra vida.",
      },
      {
        iconType: "Sparkles",
        itemTitle: "Jesús murió por mí",
        itemDescription:
          "Jesucristo murió en la Cruz en nuestro lugar y resucitó, restaurando nuestra relación con Dios.",
      },
      {
        iconType: "Footprints",
        itemTitle: "¿Elegiré seguir a Jesús?",
        itemDescription:
          "A través de la fe podemos aceptar el regalo de Dios y comenzar una relación personal con Él.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="The Four"
      description="Cuatro verdades para compartir tu fe."
      imageUrl="/the-four/The Four-01.jpg"
      imageAlt="The Four — cuatro verdades del evangelio"
      introSectionData={introSectionData}
    >
      <MinistryNavigation
        hierarchy={[
          { name: "Servicio", href: "/ministerios/servicio" },
          { name: "Conexión", href: "/ministerios/conexion" },
          { name: "Redes de Amor", href: "/ministerios/redes-de-amor" },
          { name: "Pescadores", href: "/ministerios/pescadores" },
        ]}
        current="The Four"
        backLink="/ministerios/pescadores"
        backLabel="Volver a Pescadores"
      />
      <MinistryContentSection {...truthsData} />
    </PublicPageLayout>
  );
}
