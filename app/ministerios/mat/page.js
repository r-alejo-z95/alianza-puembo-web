import { pageSection, pageHeaderContainer, pageTitle, pageDescription } from "@/lib/styles";

export const metadata = {
  title: "Ministerio de Adoración y Teología (MAT)",
  description: "Explora la profundidad de la adoración y la teología a través de nuestro ministerio MAT. Fórmate y sirve con un corazón que adora.",
  alternates: {
    canonical: "/ministerios/mat",
  },
};

export default function Mat() {
  return (
    <section className={pageSection}>
      <div className={pageHeaderContainer}>
        <h1 className={pageTitle}>
          Ministerio de Adoración y Teología (MAT)
        </h1>
        <p className={pageDescription}>
          Profundiza en la adoración y el estudio de la Palabra de Dios.
        </p>
      </div>
      {/* Contenido del ministerio MAT */}
    </section>
  );
}
