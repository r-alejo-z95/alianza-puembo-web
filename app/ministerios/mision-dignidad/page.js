import { pageSection, pageHeaderContainer, pageTitle, pageDescription } from "@/lib/styles";

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
