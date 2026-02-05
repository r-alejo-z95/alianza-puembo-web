import FormManager from "@/components/admin/managers/FormManager";
import { verifyPermission } from "@/lib/auth/guards";
import {
  adminPageSection,
  adminPageHeaderContainer,
  adminPageTitle,
  adminPageDescription,
} from "@/lib/styles.ts";
import { ClipboardList, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Formularios Internos",
  description: "Gestión de procesos internos y requerimientos del staff.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StaffAdminPage() {
  // Verificar permiso de internos
  await verifyPermission("perm_internal_forms");

  return (
    <section className={adminPageSection}>
      <header className={adminPageHeaderContainer}>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px w-12 bg-[var(--puembo-green)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--puembo-green)]">
            Staff & Procesos
          </span>
        </div>
        <h1 className={adminPageTitle}>
          Panel de{" "}
          <span className="text-[var(--puembo-green)] italic">Staff</span>
        </h1>
        <p className={adminPageDescription}>
          Gestiona requerimientos y procesos operativos internos.
        </p>
              </header>
      
            <div className="mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] shadow-sm max-w-3xl">
      
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <span>Área Restringida</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Estás en la sección operativa de la iglesia. Los formularios creados aquí <strong>no son públicos</strong> y solo pueden ser completados por el staff autorizado.
            </p>
          </div>
        </div>
      </div>

      {/* Renderizar el manager filtrando por internos */}
      <FormManager isInternal={true} />
    </section>
  );
}