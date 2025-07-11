import ContactForm from '@/components/public/forms/ContactForm';
import { sectionTitle, sectionPy } from "@/lib/styles";

export function ContactFormSection() {
  return (
    <div className="bg-sky-800 text-gray-800">
      <div className={`container mx-auto px-4 text-center ${sectionPy}`}>
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
          <h2 className={`${sectionTitle} mb-4 text-sky-800`}>
            Envíanos un Mensaje
          </h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
