import FormManager from "@/components/admin/managers/FormManager";
import GoogleConnectButton from "@/components/admin/auth/GoogleConnectButton";
import { verifyPermission } from "@/lib/auth/guards";
import {
  adminPageSection,
  adminPageHeaderContainer,
  adminPageTitle,
  adminPageDescription,
} from "@/lib/styles.ts";
import { getCachedForms } from "@/lib/data/forms";
import { getCachedGoogleSettings } from "@/lib/data/settings";
import { CheckCircle2, Globe, ExternalLink, Database } from "lucide-react";
import { cn } from "@/lib/utils.ts";

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

  const [googleConn, initialForms] = await Promise.all([
    getCachedGoogleSettings(),
    getCachedForms(false) // Public forms
  ]);

  const isConnected = !!googleConn;

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
          Crea formularios para registros y encuestas. Conecta con Google para almacenamiento.
        </p>
      </header>

      <div className="mb-12">
        {isConnected ? (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-emerald-50 border border-emerald-100 p-8 rounded-[2rem] shadow-sm max-w-3xl">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
              <Database className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Sincronización Activa con Google Drive</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Los formularios se guardan automáticamente en:{" "}
                <strong>{googleConn.account_name}</strong> (
                {googleConn.account_email}).
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-amber-50 border border-amber-100 p-8 rounded-[2rem] shadow-sm max-w-3xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/20">
              <Globe className="w-7 h-7" />
            </div>
            <div className="space-y-4">
              <p className="text-sm text-amber-800 leading-relaxed font-medium">
                Conecta la cuenta de Inscripciones Eventos Puembo
                (eventospuembo@gmail.com) para automatizar la creación de hojas
                de cálculo y el almacenamiento de adjuntos en Drive.
              </p>
              <GoogleConnectButton />
            </div>
          </div>
        )}
      </div>

      <FormManager initialForms={initialForms} isInternal={false} />
    </section>
  );
}
