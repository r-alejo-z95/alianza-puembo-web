import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { ZoomableImage } from "@/components/public/layout/pages/involucrate/ruta/ZoomableImage";
import { cn } from "@/lib/utils.ts";
import { contentSection } from "@/lib/styles";

export const metadata = {
  title: "Ruta de la Fe",
  description:
    "Descubre tu camino de crecimiento y propósito en Alianza Puembo.",
  alternates: {
    canonical: "/involucrate/ruta",
  },
};

export default function Ruta() {
  const pageTitle = "Ruta: Tu Camino en Nuestra Iglesia";
  const pageDescription = [
    "En Alianza Puembo, creemos que la vida cristiana es un viaje de crecimiento y descubrimiento. Nuestra 'Ruta' está diseñada para guiarte en cada etapa de tu caminar, desde tus primeros pasos hasta el desarrollo de tu propósito en Dios.",
  ];

  return (
    <PublicPageLayout
      title="Ruta"
      description="Un camino diseñado para tu crecimiento espiritual."
      // Hemos quitado la imagen específica para mantener el header limpio
      imageUrl="/involucrate/ruta-portada.jpg"
      imageAlt="Ruta de la Iglesia Alianza Puembo"
      introSectionData={{
        title: pageTitle,
        description: pageDescription,
      }}
    >
      <section className="bg-gray-50/50 py-24 md:py-32 overflow-hidden border-t border-gray-100">
        <div className={cn(contentSection, "max-w-7xl mx-auto space-y-16")}>
          {/* Visual Separator & Title */}
          <div className="flex items-center gap-6 px-4">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 whitespace-nowrap">
              Mapa de la Ruta
            </h2>
            <div className="h-1.5 bg-[var(--puembo-green)]/20 grow rounded-full" />
            <div className="h-1.5 w-12 bg-[var(--puembo-green)] rounded-full" />
          </div>

          {/* Interactive Image Area */}
          <div className="relative group">
            <div className="relative aspect-[16/11] md:aspect-[3/2] rounded-[3rem] overflow-hidden shadow-2xl bg-white p-4 md:p-8 border border-gray-100">
              <ZoomableImage
                src="/involucrate/ruta.jpg"
                alt="Mapa detallado de la Ruta de la Fe"
                width={3508}
                height={2481}
                sizes="(max-width: 768px) 768px, 100vw"
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                quality={100}
              />
            </div>

            {/* Decorative accent */}
            <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-[var(--puembo-green)]/5 rounded-full blur-3xl -z-10" />
          </div>

          {/* Footer Guide - Only visible on mobile */}
          <div className="max-w-2xl mx-auto text-center pt-12 md:hidden">
            <p className="text-sm text-gray-400 font-light italic">
              * Toca la imagen para ampliar y explorar los detalles de cada
              etapa.
            </p>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}
