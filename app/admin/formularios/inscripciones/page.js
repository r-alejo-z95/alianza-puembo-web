import AllSubmissionsManager from "@/components/admin/managers/AllSubmissionsManager";
import Link from "next/link";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyPermission } from "@/lib/auth/guards";
import {
  adminPageSection,
  adminPageHeaderContainer,
  adminPageTitle,
  adminPageDescription,
} from "@/lib/styles.ts";
import { getAllSubmissions } from "@/lib/data/forms";

export const metadata = {
  title: "Buscador de Inscripciones",
  description: "Busca inscripciones por evento o nombre de inscrito.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function InscripcionesAdminPage() {
  await verifyPermission("perm_forms");

  const submissions = await getAllSubmissions();

  return (
    <section className={adminPageSection}>
      <Link
        href="/admin/formularios"
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-[var(--puembo-green)] transition-all group"
      >
        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
        Inventario de Formularios
      </Link>
      <div className="flex items-end justify-between gap-4">
        <header className={adminPageHeaderContainer}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-12 bg-[var(--puembo-green)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--puembo-green)]">Formularios</span>
          </div>
          <h1 className={adminPageTitle}>
            Buscador de <span className="text-[var(--puembo-green)] italic">Inscripciones</span>
          </h1>
          <p className={adminPageDescription}>
            Busca y gestiona inscripciones de todos los formularios activos.
          </p>
        </header>
        <Button asChild variant="green" className="rounded-full px-6 mb-10 shadow-lg shadow-[var(--puembo-green)]/20 shrink-0">
          <Link href="/admin/formularios/inscripciones/manual">
            <PlusCircle className="w-4 h-4 mr-2" />
            Nueva inscripción manual
          </Link>
        </Button>
      </div>
      <AllSubmissionsManager initialSubmissions={submissions} />
    </section>
  );
}
