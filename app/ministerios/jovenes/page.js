import { pageSection, pageHeaderContainer, pageTitle, pageDescription } from "@/lib/styles";

export const metadata = {
  title: "Ministerio de Jóvenes",
  description: "Descubre un espacio dinámico para jóvenes donde pueden crecer en su fe, construir amistades sólidas y encontrar su propósito en Cristo.",
  alternates: {
    canonical: "/ministerios/jovenes",
  },
};

export default function Jovenes() {
  return (
    <section className={pageSection}>
      <div className={pageHeaderContainer}>
        <h1 className={pageTitle}>
          Ministerio de Jóvenes
        </h1>
        <p className={pageDescription}>
          Un espacio para crecer en fe, amistad y propósito.
        </p>
      </div>
      {/* Contenido del ministerio de jóvenes */}
    </section>
  );
}
