import { MatActivitiesSection } from "@/components/public/layout/pages/ministerios/mat/MatActivitiesSection";
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";

export const metadata = {
  title: "Ministerio de Música, Artes y Tecnología",
  description: "Un ministerio dedicado a la adoración y el servicio a través de la música y las artes.",
  alternates: {
    canonical: "/ministerios/mat",
  },
};

export default function Mat() {
  const introSectionData = {
    title: "Adoración, Arte y Tecnología",
    description: [
      "El Ministerio de Música, Artes y Tecnología (MAT) es un espacio donde la creatividad se une a la fe para glorificar a Dios. Creemos que el arte y la tecnología son herramientas poderosas para expresar nuestra adoración y comunicar el mensaje del evangelio.",
      "Si tienes talentos en música, canto, teatro, producción audiovisual, sonido, iluminación o cualquier otra forma de expresión artística, te invitamos a unirte a nuestro equipo y servir con excelencia.",
    ],
    imageUrl: "/ministerios/mat/mat-intro.jpg",
    imageAlt: "Personas adorando",
    imagePosition: "right",
  };

  return (
    <PublicPageLayout
      title="Ministerio de Música, Artes y Tecnología"
      description="Un ministerio dedicado a la adoración y el servicio a través de la música y las artes."
      imageUrl="/ministerios/mat/Mat.jpg"
      imageAlt="Cantantes adorando"
      introSectionData={introSectionData}
    >
      <MatActivitiesSection />
    </PublicPageLayout>
  );
}
