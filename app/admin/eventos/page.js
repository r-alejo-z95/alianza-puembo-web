import EventManager from '@/components/admin/managers/EventManager';
import { adminPageSection, adminPageHeaderContainer, adminPageTitle, adminPageDescription } from "@/lib/styles";

export default function EventosPage() {
  return (
    <section className={adminPageSection}>
      <div className={adminPageHeaderContainer}>
        <h1 className={adminPageTitle}>
          Gestionar Eventos
        </h1>
        <p className={adminPageDescription}>
          Administra los eventos de la iglesia.
        </p>
      </div>
      <EventManager />
    </section>
  );
}
