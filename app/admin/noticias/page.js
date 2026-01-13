import NewsManager from '@/components/admin/managers/NewsManager';
import { NewsProvider } from '@/components/providers/NewsProvider';
import { adminPageSection, adminPageHeaderContainer, adminPageTitle, adminPageDescription } from "@/lib/styles.ts";

export const metadata = {
  title: "Gestionar Noticias",
  description: "Administra las noticias de la iglesia: crea, edita y elimina noticias.",
  robots: {
    index: false,
    follow: false
  },
};

export default function NoticiasAdminPage() {
  return (
    <NewsProvider>
      <section className={adminPageSection}>
        <div className={adminPageHeaderContainer}>
          <h1 className={adminPageTitle}>
            Gestionar Noticias
          </h1>
          <p className={adminPageDescription}>
            Administra las noticias de la iglesia.
          </p>
        </div>
        <NewsManager />
      </section>
    </NewsProvider>
  );
}
