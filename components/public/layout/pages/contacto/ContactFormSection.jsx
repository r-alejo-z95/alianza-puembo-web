import ContactForm from '@/components/public/forms/ContactForm';
import { sectionTitle, sectionPy, formSection } from "@/lib/styles";

export function ContactFormSection() {
  return (
    <div className="bg-sky-800 text-gray-800">
      <div className={`container mx-auto px-4 text-center ${sectionPy}`}>
        <div className={formSection}>
          <h2 className={`${sectionTitle} mb-4 text-sky-800`}>
            Envíanos un Mensaje
          </h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
