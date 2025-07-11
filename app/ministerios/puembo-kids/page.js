import { pageSection, pageHeaderContainer, pageTitle, pageDescription } from "@/lib/styles";

export const metadata = {
  title: "Puembo Kids",
  description: "Puembo Kids es nuestro ministerio para niños, un lugar lleno de diversión, seguridad y enseñanza bíblica para que los más pequeños conozcan a Jesús.",
  alternates: {
    canonical: "/ministerios/puembo-kids",
  },
};

export default function PuemboKids() {
  return (
    <section className={pageSection}>
      <div className={pageHeaderContainer}>
        <h1 className={pageTitle}>
          Puembo Kids
        </h1>
        <p className={pageDescription}>
          Un espacio divertido y seguro para que los más pequeños aprendan de Jesús.
        </p>
      </div>
      {/* Contenido de Puembo Kids */}
    </section>
  );
}
