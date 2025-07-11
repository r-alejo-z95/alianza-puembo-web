import { pageSection, pageHeaderContainer, pageTitle, pageDescription } from "@/lib/styles";

export const metadata = {
  title: "Noticias",
  description: "Mantente al día con las últimas noticias, anuncios y eventos importantes de Alianza Puembo. ¡No te pierdas nada!",
  alternates: {
    canonical: "/noticias",
  },
};

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
