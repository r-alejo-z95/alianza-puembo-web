
import ContactForm from '@/components/ContactForm';
import { pageSection, pageHeaderContainer, pageTitle, pageDescription } from "@/lib/styles";

export default function ContactPage() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight font-merriweather">Contáctanos</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Estamos aquí para servirte. Envíanos un mensaje y nos pondremos en contacto contigo.
        </p>
      </div>

      <div className="flex flex-col items-center">
        <ContactForm />
      </div>
    </section>
  );
}
