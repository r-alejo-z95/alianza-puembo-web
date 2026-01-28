"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import FluentRenderer from "@/components/public/forms/fluent-renderer/FluentRenderer";
import { toast } from "sonner";
import Image from "next/image";

const LoadingState = () => (
  <div className="fixed inset-0 bg-white flex flex-col gap-6 justify-center items-center z-50">
    <div className="relative w-20 h-20">
         <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
         <div className="absolute inset-0 border-4 border-[var(--puembo-green)] rounded-full border-t-transparent animate-spin"></div>
         <Image src="/icons/church-icon.png" width={32} height={32} alt="Logo" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50" />
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse">
      Cargando...
    </p>
  </div>
);

const ErrorState = () => (
    <div className="fixed inset-0 bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
            <AlertTriangle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Formulario no disponible</h1>
        <p className="text-gray-500 max-w-md">El formulario que buscas no existe, ha sido desactivado o el enlace es incorrecto.</p>
    </div>
);

export default function PublicFormPage() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { slug } = useParams();

  useEffect(() => {
    const fetchForm = async () => {
      if (!slug) return;
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("forms")
        .select("*, form_fields(*)")
        .eq("slug", slug)
        .eq("is_archived", false)
        .eq("enabled", true) // Ensure we only show enabled forms
        .single();

      if (error) {
        console.error("Form fetch error:", error);
        setError(true);
      } else {
        if (data.form_fields) {
            data.form_fields.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
        }
        setForm(data);
      }
      setLoading(false);
    };
    fetchForm();
  }, [slug]);

  if (loading) return <LoadingState />;
  if (error || !form) return <ErrorState />;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans selection:bg-[var(--puembo-green)]/20 selection:text-[var(--puembo-green)]">
        <FluentRenderer form={form} />
    </div>
  );
}
