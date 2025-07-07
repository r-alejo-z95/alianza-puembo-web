import LomManager from '@/components/admin/managers/LomManager'
import { adminPageSection, adminPageHeaderContainer, pageTitle, pageDescription } from "@/lib/styles";

export default function LomPage() {
  return (
    <section className={adminPageSection}>
      <div className={adminPageHeaderContainer}>
        <h1 className={pageTitle}>
          Gestionar Devocionales (LOM)
        </h1>
        <p className={pageDescription}>
          Administra los devocionales de Lee, Ora, Medita.
        </p>
      </div>
      <LomManager />
    </section>
  );
}
