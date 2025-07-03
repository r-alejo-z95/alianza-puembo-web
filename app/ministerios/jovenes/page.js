import { pageSection, pageHeaderContainer, pageTitle, pageDescription } from "@/lib/styles";

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
