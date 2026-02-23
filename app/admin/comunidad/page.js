import { Suspense } from "react";
import { 
  adminPageSection, 
  adminPageHeaderContainer, 
  adminPageTitle, 
  adminPageDescription 
} from "@/lib/styles.ts";
import { getCachedContactMessages } from "@/lib/data/contact";
import { getCachedAllPrayerRequestsForAdmin } from "@/lib/data/prayer";
import ComunidadHubClient from "./ComunidadHubClient";
import { verifyPermission } from "@/lib/auth/guards";

export const metadata = {
  title: "Gestión de Comunidad",
  description: "Atención a usuarios y moderación de oración.",
};

export default async function ComunidadHubPage() {
  await verifyPermission("perm_comunidad");

  const [initialMessages, initialRequests] = await Promise.all([
    getCachedContactMessages(),
    getCachedAllPrayerRequestsForAdmin()
  ]);

  return (
    <section className={adminPageSection}>
      <header className={adminPageHeaderContainer}>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px w-12 bg-[var(--puembo-green)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--puembo-green)]">
            Interacción
          </span>
        </div>
        <h1 className={adminPageTitle}>
          Gestión de <span className="text-[var(--puembo-green)] italic">Comunidad</span>
        </h1>
        <p className={adminPageDescription}>
          Centraliza la atención a usuarios y modera peticiones de oración.
        </p>
      </header>

      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-12 w-12 rounded-full border-4 border-gray-100 border-t-[var(--puembo-green)] animate-spin" />
        </div>
      }>
        <ComunidadHubClient 
          initialMessages={initialMessages} 
          initialRequests={initialRequests} 
        />
      </Suspense>
    </section>
  );
}
