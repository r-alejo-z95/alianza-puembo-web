import InternalResponseManager from "@/components/admin/managers/InternalResponseManager";
import { verifyPermission } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import {
  adminPageSection,
  adminPageHeaderContainer,
  adminPageTitle,
  adminPageDescription,
} from "@/lib/styles.ts";
import { ShieldCheck, ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Respuestas de Formularios Internos - Staff",
  description: "Bandeja de entrada operativa para procesos internos.",
  robots: { index: false, follow: false },
};

export default async function StaffFormResponsesPage({ params }) {
  let user;
  try {
    user = await verifyPermission("perm_internal_forms");
  } catch (e) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-8 bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-100">
          <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto text-red-500 shadow-inner">
            <Lock className="w-10 h-10" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-serif font-black text-gray-900 leading-tight">Acceso Denegado</h1>
            <p className="text-gray-500 font-medium leading-relaxed">
              No tienes permisos para ver estas respuestas. Asegúrate de estar logueado con tu cuenta oficial de equipo.
            </p>
          </div>
          <div className="pt-4 flex flex-col gap-3">
            <Link href="/login">
              <Button className="w-full rounded-full h-14 bg-black text-white hover:bg-gray-800 font-bold uppercase tracking-widest text-[10px] shadow-xl">
                Revisar mi Cuenta
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { slug } = await params;
  const supabase = await createClient();
  
  // 1. Obtener el formulario y sus campos
  const { data: form, error: formError } = await supabase
    .from("forms")
    .select("*, form_fields(*), profiles(full_name)")
    .eq("slug", slug)
    .eq("is_internal", true)
    .single();

  if (formError || !form) {
    return notFound();
  }

  // 2. Obtener todas las respuestas (incluyendo las archivadas para la papelera interna del manager)
  const { data: submissions, error: submissionsError } = await supabase
    .from("form_submissions")
    .select("*, profiles(*)")
    .eq("form_id", form.id)
    .order("created_at", { ascending: false });

  if (submissionsError) {
    console.error("Error fetching submissions:", submissionsError);
  }

  // Ordenar campos por order_index
  if (form.form_fields) {
    form.form_fields.sort(
      (a, b) => (a.order_index ?? 0) - (b.order_index ?? b.order ?? 0)
    );
  }

  return (
    <section className={adminPageSection}>
      <header className={adminPageHeaderContainer}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <Link href="/admin/staff">
            <Button variant="ghost" className="rounded-2xl text-gray-400 hover:text-gray-900 transition-all gap-2 px-0 hover:bg-transparent group">
              <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Volver a Staff</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Control Interno Autorizado</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-[var(--puembo-green)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--puembo-green)]">
              Bitácora Staff
            </span>
          </div>
          <h1 className={adminPageTitle}>
            Respuestas: <br className="md:hidden" />
            <span className="text-[var(--puembo-green)] italic font-light font-serif">{form.title}</span>
          </h1>
          <p className={adminPageDescription}>
            Visualiza y gestiona las respuestas de este proceso operativo.
          </p>
        </div>
      </header>

      <InternalResponseManager 
        form={form} 
        initialSubmissions={submissions || []} 
      />
    </section>
  );
}