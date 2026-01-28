"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { Loader2, AlertTriangle, Clock } from "lucide-react";
import FluentRenderer from "@/components/public/forms/fluent-renderer/FluentRenderer";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const LoadingState = () => (
  <div className="fixed inset-0 bg-white flex flex-col gap-6 justify-center items-center z-50">
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-[var(--puembo-green)] rounded-full border-t-transparent animate-spin"></div>
      <Image
        src="/icons/church-icon.png"
        width={32}
        height={32}
        alt="Logo"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50"
      />
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse">
      Cargando...
    </p>
  </div>
);

const ErrorState = ({ type = "not_found" }) => (
  <div className="fixed inset-0 bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
    <div
      className={cn(
        "w-24 h-24 rounded-full flex items-center justify-center mb-6",
        type === "inactive"
          ? "bg-amber-50 text-amber-500"
          : "bg-red-50 text-red-500",
      )}
    >
      {type === "inactive" ? (
        <Clock className="w-10 h-10" />
      ) : (
        <AlertTriangle className="w-10 h-10" />
      )}
    </div>
    <h1 className="text-2xl font-bold text-gray-900 mb-2">
      {type === "inactive" ? "Formulario Cerrado" : "Formulario no disponible"}
    </h1>
    <p className="text-gray-500 max-w-md">
      {type === "inactive"
        ? "Este formulario ya no acepta más respuestas. Si crees que esto es un error, por favor contacta con la administración."
        : "El formulario que buscas no existe o el enlace es incorrecto."}
    </p>
    <Button
      variant="outline"
      className="mt-8 rounded-full px-8"
      onClick={() => (window.location.href = "/")}
    >
      Volver al inicio
    </Button>
  </div>
);

export default function PublicFormPage() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState(null); // 'not_found' | 'inactive'
  const { slug } = useParams();

  useEffect(() => {
    const fetchForm = async () => {
      if (!slug) return;
      setLoading(true);
      const supabase = createClient();

      // Primero buscamos el formulario sin filtrar por enabled para saber si existe
      const { data, error } = await supabase
        .from("forms")
        .select("*, form_fields(*)")
        .eq("slug", slug)
        .eq("is_archived", false)
        .single();

      if (error || !data) {
        console.error("Form fetch error:", error);
        setErrorType("not_found");
      } else if (!data.enabled) {
        setErrorType("inactive");
        setForm(data); // Guardamos la data por si queremos mostrar el título
      } else {
        if (data.form_fields) {
          data.form_fields.sort(
            (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
          );
        }
        setForm(data);
        setErrorType(null);
      }
      setLoading(false);
    };
    fetchForm();
  }, [slug]);

  if (loading) return <LoadingState />;
  if (errorType) return <ErrorState type={errorType} />;
  if (!form) return <ErrorState type="not_found" />;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans selection:bg-[var(--puembo-green)]/20 selection:text-[var(--puembo-green)]">
      <FluentRenderer form={form} />
    </div>
  );
}
