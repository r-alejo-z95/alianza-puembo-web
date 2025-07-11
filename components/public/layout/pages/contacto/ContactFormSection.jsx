import ContactForm from '@/components/public/forms/ContactForm';
import { cn } from "@/lib/utils";
import { contentSection, sectionTitle, sectionText } from "@/lib/styles";

export function ContactFormSection() {
  return (
    <section className={cn(contentSection, "bg-white py-16 md:py-24")}>
      <h2 className={cn(sectionTitle, "text-center mb-12")}>
        Envíanos un Mensaje
      </h2>
      <p className={cn(sectionText, "text-center mb-8 max-w-3xl mx-auto")}>
        Estamos emocionados de conectar contigo. Ya sea que tengas preguntas, necesites oración, o simplemente quieras saludar, no dudes en contactarnos. Tu mensaje es importante para nosotros.
      </p>
      <div className="relative w-full max-w-2xl aspect-video rounded-lg overflow-hidden mb-12 mx-auto shadow-lg">
        <img src="/placeholder/contact-form.jpg" alt="Formulario de Contacto" className="object-cover w-full h-full" />
      </div>
      <div className="max-w-xl mx-auto w-full">
        <ContactForm />
      </div>
    </section>
  );
}