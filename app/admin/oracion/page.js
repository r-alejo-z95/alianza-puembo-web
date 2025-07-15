import PrayerRequestManager from '@/components/admin/managers/PrayerRequestManager';
import { adminPageSection, adminPageHeaderContainer, adminPageTitle, adminPageDescription } from "@/lib/styles.ts";

export const metadata = {
  title: "Gestionar Peticiones de Oración",
  description: "Administra las peticiones de oración enviadas por los usuarios: revisa, aprueba o elimina.",
  robots: { 
    index: false, 
    follow: false 
  },
};

export default function OracionAdminPage() {
  return (
    <section className={adminPageSection}>
      <div className={adminPageHeaderContainer}>
        <h1 className={adminPageTitle}>
          Gestionar Peticiones de Oración
        </h1>
        <p className={adminPageDescription}>
          Administra las peticiones de oración recibidas.
        </p>
      </div>
      <PrayerRequestManager />
    </section>
  );
}
