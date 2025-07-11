
import ContactForm from '@/components/public/forms/ContactForm';
import { contentSection } from "@/lib/styles";
import { PageHeader } from "@/components/public/layout/pages/PageHeader";

export const metadata = {
  title: "Contáctanos",
  description: "¿Tienes preguntas, sugerencias o necesitas ayuda? Contáctanos a través de nuestro formulario o encuentra nuestra información de contacto.",
  alternates: {
    canonical: "/contacto",
  },
};

export default function ContactPage() {
  return (
    <section>
      <PageHeader
        title="Contáctanos"
        description="Estamos aquí para servirte. Envíanos un mensaje y nos pondremos en contacto contigo."
        imageUrl="/contacto/Contacto.jpg"
        imageAlt="Personas interactuando en un evento de la iglesia"
      />

      <div className={contentSection + " items-center"}>
        <ContactForm />
      </div>
    </section>
  );
}
