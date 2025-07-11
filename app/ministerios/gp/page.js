import { pageSection, pageHeaderContainer, pageTitle, pageDescription } from "@/lib/styles";

export const metadata = {
  title: "Grupos Pequeños",
  description: "Únete a nuestros grupos pequeños para crecer en comunidad, estudiar la Biblia y fortalecer tu fe junto a otros miembros de la iglesia.",
  alternates: {
    canonical: "/ministerios/gp",
  },
};

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
