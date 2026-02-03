import { verifyPermission } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import FluentRenderer from "@/components/public/forms/fluent-renderer/FluentRenderer";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Proceso Staff",
  description: "Formulario operativo para miembros autorizados del equipo.",
  robots: { index: false, follow: false },
};

export default async function StaffFormViewPage({ params }) {
  let user;
  try {
    user = await verifyPermission("perm_internal_forms");
  } catch (e) {
    // UI de Acceso Denegado Personalizada
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-8 bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto text-red-500 shadow-inner">
            <Lock className="w-10 h-10" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-serif font-black text-gray-900 leading-tight">Área Restringida</h1>
            <p className="text-gray-500 font-medium leading-relaxed">
              Este proceso es exclusivo para el staff administrativo. Si eres miembro del equipo, asegúrate de haber iniciado sesión con tu cuenta oficial.
            </p>
          </div>
          <div className="pt-4 flex flex-col gap-3">
            <Link href="/login">
              <Button className="w-full rounded-full h-14 bg-black text-white hover:bg-gray-800 font-bold uppercase tracking-widest text-[10px] shadow-xl">
                Iniciar Sesión como Admin
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full rounded-full h-12 text-gray-400 hover:text-gray-600 font-bold uppercase tracking-widest text-[10px]">
                Volver al Sitio Público
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { slug } = await params;
  const supabase = await createClient();
  const { data: form } = await supabase
    .from("forms")
    .select("*, form_fields(*)")
    .eq("slug", slug)
    .eq("is_internal", true)
    .eq("is_archived", false)
    .single();

  if (!form) {
    notFound();
  }

  // Ordenar campos
  if (form.form_fields) {
    form.form_fields.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  }

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Texture overlay like public forms */}
      <div className="fixed inset-0 opacity-100 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/45-degree-fabric-light.png')]" />
      
      <div className="relative z-10">
        <FluentRenderer form={form} />
      </div>

      {/* Floating Exit Button for Admin */}
      <div className="fixed top-6 right-6 z-[100]">
        <Link href="/admin/staff">
          <Button variant="outline" className="rounded-full bg-white/80 backdrop-blur-md shadow-xl border-gray-100 font-bold text-[9px] uppercase tracking-widest gap-2 hover:bg-[var(--puembo-green)] hover:text-white transition-all h-10 px-5">
            <ArrowLeft className="w-3.5 h-3.5" /> Salir de este Formulario
          </Button>
        </Link>
      </div>
    </div>
  );
}
