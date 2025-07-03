import { pageSection, pageHeaderContainer, pageTitle, pageDescription } from "@/lib/styles";

export default function GruposPequenos() {
  return (
    <section className={pageSection}>
      <div className={pageHeaderContainer}>
        <h1 className={pageTitle}>
          Grupos Pequeños
        </h1>
        <p className={pageDescription}>
          Crece en comunidad y fe a través de nuestros grupos pequeños.
        </p>
      </div>
      {/* Contenido de grupos pequeños */}
    </section>
  );
}
