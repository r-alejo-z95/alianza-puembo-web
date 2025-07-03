import { pageSection, pageHeaderContainer, pageTitle, pageDescription } from "@/lib/styles";

export default function Donaciones() {
  return (
    <section className={pageSection}>
      <div className={pageHeaderContainer}>
        <h1 className={pageTitle}>
          Donaciones
        </h1>
        <p className={pageDescription}>
          Tu generosidad nos ayuda a seguir extendiendo el Reino de Dios.
        </p>
      </div>
      {/* Contenido de donaciones */}
    </section>
  );
}
