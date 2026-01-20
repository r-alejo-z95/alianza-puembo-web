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
      <header className={adminPageHeaderContainer}>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px w-12 bg-[var(--puembo-green)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--puembo-green)]">Muro de Intercesión</span>
        </div>
        <h1 className={adminPageTitle}>
          Gestionar <span className="text-[var(--puembo-green)] italic">Peticiones de Oración</span>
        </h1>
        <p className={adminPageDescription}>
          Revisa, modera y organiza las peticiones de nuestra comunidad para asegurar un espacio de oración sano y edificante.
        </p>
      </header>
      <PrayerRequestManager />
    </section>
  );
}