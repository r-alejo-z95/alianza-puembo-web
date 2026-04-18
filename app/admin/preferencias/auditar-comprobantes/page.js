import { verifySuperAdmin } from "@/lib/auth/guards";
import ReceiptAuditManager from "@/components/admin/preferencias/ReceiptAuditManager";

export const metadata = {
  title: "Auditar Comprobantes",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AuditarComprobantesPage() {
  await verifySuperAdmin();

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-black text-gray-900">Auditar comprobantes</h1>
        <p className="max-w-3xl text-sm text-gray-500">
          Herramienta temporal para correr la lógica real de producción sobre la carpeta local{" "}
          <span className="font-mono text-xs">/comprobantes</span>.
        </p>
      </div>

      <ReceiptAuditManager />
    </div>
  );
}
