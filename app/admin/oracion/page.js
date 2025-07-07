import PrayerRequestManager from '@/components/admin/managers/PrayerRequestManager';
import { adminPageSection, adminPageHeaderContainer, pageTitle, pageDescription } from "@/lib/styles";

export default function OracionAdminPage() {
  return (
    <section className={adminPageSection}>
      <div className={adminPageHeaderContainer}>
        <h1 className={pageTitle}>
          Gestionar Peticiones de Oración
        </h1>
        <p className={pageDescription}>
          Administra las peticiones de oración recibidas.
        </p>
      </div>
      <PrayerRequestManager />
    </section>
  );
}
