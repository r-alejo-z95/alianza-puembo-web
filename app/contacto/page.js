import { ContactFormSection } from "@/components/public/layout/pages/contacto/ContactFormSection";
import { ContactInfoSection } from "@/components/public/layout/pages/contacto/ContactInfoSection";
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";

export const metadata = {
  title: "Contáctanos",
  description: "¿Tienes preguntas, sugerencias o necesitas ayuda? Contáctanos a través de nuestro formulario o encuentra nuestra información de contacto.",
  alternates: {
    canonical: "/contacto",
  },
};

export default function ContactPage() {
  const introSectionData = {
    title: "Conéctate con Nosotros",
    description: "Estamos aquí para escucharte y servirte. Ya sea que tengas preguntas, sugerencias o necesites apoyo, no dudes en contactarnos. Tu voz es importante para nosotros.",
    titleColor: "text-sky-800",
  };

  return (
    <PublicPageLayout
      title="Contáctanos"
      description="Estamos aquí para servirte. Envíanos un mensaje y nos pondremos en contacto contigo."
      imageUrl="/contacto/Contacto.jpg"
      imageAlt="Personas interactuando en un evento de la iglesia"
      introSectionData={introSectionData}
    >
      <ContactFormSection />
      <ContactInfoSection />
    </PublicPageLayout>
  );
}
