import { pageSection, pageHeaderContainer, pageTitle, pageDescription } from "@/lib/styles";

export const metadata = {
  title: "Misión Dignidad",
  description: "Conoce y participa en Misión Dignidad, nuestro ministerio de servicio y alcance comunitario que busca llevar ayuda y esperanza a quienes más lo necesitan.",
  alternates: {
    canonical: "/ministerios/mision-dignidad",
  },
};

export default function MisionDignidad() {
  return (
    <section className={pageSection}>
      <div className={pageHeaderContainer}>
        <h1 className={pageTitle}>
          Misión Dignidad
        </h1>
        <p className={pageDescription}>
          Extendiendo el amor de Cristo a los más necesitados.
        </p>
      </div>
      {/* Contenido de Misión Dignidad */}
    </section>
  );
}
