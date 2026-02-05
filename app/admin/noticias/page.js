import NewsManager from '@/components/admin/managers/NewsManager';
import { NewsProvider } from '@/components/providers/NewsProvider';
import { verifyPermission } from "@/lib/auth/guards";
import { adminPageSection, adminPageHeaderContainer, adminPageTitle, adminPageDescription } from "@/lib/styles.ts";

export const metadata = {
  title: "Gestionar Noticias",
  description: "Administra las noticias de la iglesia: crea, edita y elimina noticias.",
  robots: {
    index: false,
    follow: false
  },
};

export default async function NoticiasAdminPage() {
  await verifyPermission("perm_news");

  return (
    <NewsProvider>
      <section className={adminPageSection}>
        <header className={adminPageHeaderContainer}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-12 bg-[var(--puembo-green)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--puembo-green)]">Editorial</span>
          </div>
          <h1 className={adminPageTitle}>
            Gestionar <span className="text-[var(--puembo-green)] italic">Noticias</span>
          </h1>
          <p className={adminPageDescription}>
            Crea y administra noticias y novedades.
          </p>
        </header>
        <NewsManager />
      </section>
    </NewsProvider>
  );
}