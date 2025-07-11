import { sectionTitle, sectionText } from "@/lib/styles";
import { ContactCards } from "@/components/public/layout/pages/contacto/ContactCards";

export function ContactInfoSection() {
  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 divide-y divide-gray-200">
        <div className="py-16 md:py-24 text-center">
          <h2 className={`${sectionTitle} text-sky-800`}>
            Nuestra Información de Contacto
          </h2>
          <p className={`${sectionText} max-w-3xl mx-auto`}>
            Si tienes preguntas, sugerencias o simplemente quieres saber más sobre nuestra iglesia, no dudes en contactarnos. Estamos aquí para ayudarte y servirte.
          </p>
        </div>
      </div>
      <ContactCards />
    </div>
  );
}