import { Mail, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { contentSection, sectionTitle, sectionText } from "@/lib/styles";

export function ContactInfoSection() {
  return (
    <section className={cn(contentSection, "bg-gray-100 py-16 md:py-24")}>
      <h2 className={cn(sectionTitle, "text-center mb-12")}>
        Nuestra Información de Contacto
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center">
        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
          <Mail className="h-12 w-12 text-puembo-green mb-4" />
          <h3 className="text-xl font-semibold mb-2">Correo Electrónico</h3>
          <p className={sectionText}>info@alianzapuembo.org</p>
        </div>
        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
          <Phone className="h-12 w-12 text-puembo-green mb-4" />
          <h3 className="text-xl font-semibold mb-2">Teléfono</h3>
          <p className={sectionText}>+593 2 2345 678</p>
        </div>
        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
          <MapPin className="h-12 w-12 text-puembo-green mb-4" />
          <h3 className="text-xl font-semibold mb-2">Dirección</h3>
          <p className={sectionText}>Julio Tobar Donoso y 24 de Mayo, Puembo, Ecuador</p>
        </div>
      </div>
    </section>
  );
}