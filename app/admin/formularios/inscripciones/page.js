import AllSubmissionsManager from "@/components/admin/managers/AllSubmissionsManager";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { verifyPermission } from "@/lib/auth/guards";
import {
  adminPageSection,
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
      <div className="flex justify-end">
        <Button asChild className="rounded-full">
          <Link href="/admin/formularios/inscripciones/manual">
            Nueva inscripción manual
          </Link>
        </Button>
      </div>
      <AllSubmissionsManager initialSubmissions={submissions} />
    </section>
  );
}
