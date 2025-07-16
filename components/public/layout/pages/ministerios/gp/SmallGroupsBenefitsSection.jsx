import { cn } from "@/lib/utils.ts";
import { contentSection, sectionTitle, sectionText } from "@/lib/styles";
import { CheckCircle } from "lucide-react";

export function SmallGroupsBenefitsSection() {
  return (
    <section className={cn(contentSection, "bg-gray-100 py-16 md:py-24")}>
      <h2 className={cn(sectionTitle, "text-center mb-12")}>
        Beneficios de unirte a un Grupo Pequeño
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md">
          <CheckCircle className="h-12 w-12 text-(--puembo-green) mb-4" />
          <h3 className="text-xl font-semibold mb-2">Crecimiento Espiritual</h3>
          <p className={sectionText}>Estudia la Biblia en un ambiente íntimo y aplica sus verdades a tu vida diaria.</p>
        </div>
        <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md">
          <CheckCircle className="h-12 w-12 text-(--puembo-green) mb-4" />
          <h3 className="text-xl font-semibold mb-2">Comunidad y Amistad</h3>
          <p className={sectionText}>Construye relaciones profundas y duraderas con personas que comparten tu fe.</p>
        </div>
        <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md">
          <CheckCircle className="h-12 w-12 text-(--puembo-green) mb-4" />
          <h3 className="text-xl font-semibold mb-2">Apoyo y Oración</h3>
          <p className={sectionText}>Encuentra un espacio seguro para compartir tus cargas y recibir apoyo en oración.</p>
        </div>
        <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md">
          <CheckCircle className="h-12 w-12 text-(--puembo-green) mb-4" />
          <h3 className="text-xl font-semibold mb-2">Servicio y Misión</h3>
          <p className={sectionText}>Descubre oportunidades para servir a tu comunidad y extender el Reino de Dios.</p>
        </div>
        <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md">
          <CheckCircle className="h-12 w-12 text-(--puembo-green) mb-4" />
          <h3 className="text-xl font-semibold mb-2">Discipulado Personalizado</h3>
          <p className={sectionText}>Recibe mentoría y guía en tu desarrollo espiritual de la mano de líderes experimentados.</p>
        </div>
      </div>
    </section>
  );
}