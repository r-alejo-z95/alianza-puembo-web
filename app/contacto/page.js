
import ContactForm from '@/components/public/forms/ContactForm';
import { pageSection, pageHeaderContainer, pageTitle, pageDescription } from "@/lib/styles";

export default function ContactPage() {
  return (
    <section className={pageSection}>
      <div className={pageHeaderContainer}>
        <h1 className={pageTitle}>Contáctanos</h1>
        <p className={pageDescription}>
          Estamos aquí para servirte. Envíanos un mensaje y nos pondremos en contacto contigo.
        </p>
      </div>

      <div className="flex flex-col items-center">
        <ContactForm />
      </div>
    </section>
  );
}
