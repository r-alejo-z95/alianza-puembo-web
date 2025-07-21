import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { ZoomableImage } from "@/components/public/layout/pages/involucrate/ruta/ZoomableImage";

export const metadata = {
  title: "Ruta",
  description: "Descubre tu camino en la fe en Alianza Puembo.",
  alternates: {
    canonical: "/involucrate/ruta",
  },
};

export default function Ruta() {
  const pageTitle = "Ruta: Descubre tu Camino en la Fe";
  const pageDescription = [
    "En Alianza Puembo, creemos que la vida cristiana es un viaje de crecimiento y descubrimiento. Nuestra 'Ruta' está diseñada para guiarte en cada etapa de tu caminar de fe, desde tus primeros pasos hasta el desarrollo de tu propósito en Dios.",
    "Te invitamos a explorar los diferentes hitos de esta ruta, donde encontrarás herramientas, enseñanzas y comunidad para fortalecer tu relación con Dios y con los demás.",
  ];

  return (
    <PublicPageLayout
      title="Ruta"
      description="Descubre tu camino en la fe."
      imageUrl="/involucrate/ruta-portada.jpg"
      imageAlt="Ruta"
      introSectionData={{
        title: pageTitle,
        description: pageDescription,
      }}
    >
      <div className="container mx-auto px-4 lg:px-8 -mt-8 md:-mt-16">
        <div className="flex justify-center">
          <ZoomableImage
            src="/involucrate/ruta.jpg"
            alt="Ruta de la Fe"
            width={3508}
            height={2481}
            sizes="(max-width: 768px) 768px, 100vw"
            className="max-w-full h-auto object-contain"
          />
        </div>
      </div>
    </PublicPageLayout>
  );
}
