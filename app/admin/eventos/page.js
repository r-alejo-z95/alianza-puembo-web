import EventManager from '@/components/EventManager';
import { adminPageSection, adminPageHeaderContainer, pageTitle, pageDescription } from "@/lib/styles";

export default function EventosPage() {
  return (
    <section className={adminPageSection}>
      <div className={adminPageHeaderContainer}>
        <h1 className={pageTitle}>
          Gestionar Eventos
        </h1>
        <p className={pageDescription}>
          Administra los eventos de la iglesia.
        </p>
      </div>
      <EventManager />
    </section>
  );
}
