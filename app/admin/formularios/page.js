import FormManager from "@/components/admin/managers/FormManager";
import GoogleConnectButton from "@/components/admin/auth/GoogleConnectButton";
import {
  adminPageSection,
  adminPageHeaderContainer,
  adminPageTitle,
  adminPageDescription,
} from "@/lib/styles.ts";
import { createClient } from "@/lib/supabase/server";
import { CheckCircle2, Globe, ExternalLink } from "lucide-react";

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
  const supabase = await createClient();
  const { data: googleConn } = await supabase
    .from("google_integration")
    .select("account_name, account_email")
    .eq("id", 1)
    .single();

  const isConnected = !!googleConn;

  return (
    <section className={adminPageSection}>
      <div className={adminPageHeaderContainer}>
        <div className="grow">
          <h1 className={adminPageTitle}>Gestionar Formularios</h1>
          <p className={adminPageDescription}>
            Crea y administra formularios personalizados para diversos
            propósitos.
          </p>
        </div>
      </div>
      {/* <div className="flex flex-col gap-4 mb-4">
        {isConnected ? (
          <div className="flex flex-col items-start gap-2 bg-emerald-50 border border-emerald-200 p-4 rounded-lg shadow-sm max-w-md">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-5 h-5" />
              <span>Conectado a Google</span>
            </div>
            <p className="text-xs text-gray-600 text-left">
              Los formularios se guardarán automáticamente en la cuenta:{" "}
              <strong>
                {googleConn.account_name} ({googleConn.account_email})
              </strong>
              .
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-2 bg-amber-50 border border-amber-200 p-4 rounded-lg shadow-sm max-w-md">
            <p className="text-xs text-amber-700 max-w-xs text-right mb-1">
              Conecta la cuenta de Inscripciones Eventos Puembo
              (eventospuembo@gmail.com) para habilitar la creación automática de
              hojas de cálculo y almacenamiento en Drive.
            </p>
            <GoogleConnectButton />
          </div>
        )}
      </div> */}
      <FormManager />
    </section>
  );
}
