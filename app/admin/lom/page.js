import LomManager from '@/components/admin/managers/LomManager'
import { adminPageSection, adminPageHeaderContainer, adminPageTitle, adminPageDescription } from "@/lib/styles";

export default function LomPage() {
  return (
    <section className={adminPageSection}>
      <div className={adminPageHeaderContainer}>
        <h1 className={adminPageTitle}>
          Gestionar Devocionales (LOM)
        </h1>
        <p className={adminPageDescription}>
          Administra los devocionales de Lee, Ora, Medita.
        </p>
      </div>
      <LomManager />
    </section>
  );
}
