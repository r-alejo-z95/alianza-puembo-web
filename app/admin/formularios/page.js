import FormManager from "@/components/admin/managers/FormManager";
import { verifyPermission } from "@/lib/auth/guards";
import {
  adminPageSection,
  adminPageHeaderContainer,
  adminPageTitle,
  adminPageDescription,
} from "@/lib/styles.ts";
import { getCachedForms } from "@/lib/data/forms";
import { AlertTriangle, BarChart3, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Gestionar Formularios",
  description:
    "Administra los formularios personalizados para eventos y registros.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function FormulariosAdminPage() {
  await verifyPermission("perm_forms");

  const initialForms = await getCachedForms(false);

  return (
    <section className={adminPageSection}>
      <header className={adminPageHeaderContainer}>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px w-12 bg-[var(--puembo-green)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--puembo-green)]">
            Herramientas
          </span>
        </div>
        <h1 className={adminPageTitle}>
          Gestionar{" "}
          <span className="text-[var(--puembo-green)] italic">Formularios</span>
        </h1>
        <p className={adminPageDescription}>
          Administra formularios y registros desde aquí. Ya no dependemos de Google Sheets ni Google Drive para el flujo operativo.
        </p>
      </header>

      <div className="mb-12">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-red-200 bg-gradient-to-br from-red-600 via-rose-600 to-orange-500 p-1 shadow-2xl shadow-red-500/15">
          <div className="relative rounded-[2.4rem] bg-black px-6 py-8 md:px-10 md:py-10 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_30%)]" />
            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-rose-100">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Aviso importante
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight">
                  Ya no usamos Google Sheets ni Google Drive para formularios.
                </h2>
                <p className="text-sm md:text-base leading-relaxed text-white/80 max-w-2xl">
                  Todo se administra dentro del panel. Para ver el estado de las inscripciones, entra a <strong>Analíticas</strong>. Si necesitas descargar un Excel, hazlo desde ahí. Si quieres revisar el dinero recaudado por formulario o por inscrito, ve a <strong>Inscripciones</strong>.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:min-w-[320px]">
                <div className="flex h-auto w-full justify-start gap-3 rounded-[1.5rem] bg-white px-5 py-4 text-left text-black">
                    <BarChart3 className="h-5 w-5 text-rose-600" />
                    <span className="flex flex-col items-start">
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
                        Analíticas
                      </span>
                      <span className="text-sm font-semibold">
                        Abre cada formulario para ver el estado y descargar Excel
                      </span>
                    </span>
                </div>
                <Button asChild className="h-auto w-full justify-start gap-3 rounded-[1.5rem] bg-white/10 px-5 py-4 text-left text-white hover:bg-white/15">
                  <Link href="/admin/formularios/inscripciones">
                    <FileText className="h-5 w-5 text-amber-300" />
                    <span className="flex flex-col items-start">
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
                        Ver inscripciones
                      </span>
                      <span className="text-sm font-semibold">
                        Revisar recaudación por inscrito
                      </span>
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FormManager initialForms={initialForms} isInternal={false} />
    </section>
  );
}
