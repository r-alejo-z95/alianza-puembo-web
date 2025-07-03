import { pageSection, pageHeaderContainer, pageTitle, pageDescription } from "@/lib/styles";

export default function Noticias() {
  return (
    <section className={pageSection}>
      <div className={pageHeaderContainer}>
        <h1 className={pageTitle}>
          Noticias
        </h1>
        <p className={pageDescription}>
          Mantente informado sobre los últimos acontecimientos de nuestra iglesia.
        </p>
      </div>
      {/* Contenido de noticias */}
    </section>
  );
}
