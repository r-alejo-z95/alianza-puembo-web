"use client";

import { cn } from "@/lib/utils";
import FluentRenderer from "@/components/public/forms/fluent-renderer/FluentRenderer";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock } from "lucide-react";

export const LoadingState = () => (
  <div className="fixed inset-0 bg-[#FAFAFA] flex flex-col gap-8 justify-center items-center z-50">
    <div className="relative">
      <div className="absolute inset-[-20px] border border-[var(--puembo-green)]/10 rounded-full animate-[ping_3s_linear_infinite]" />
      <div className="absolute inset-[-40px] border border-[var(--puembo-green)]/5 rounded-full animate-[ping_3s_linear_infinite_1s]" />

      <div className="relative w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center overflow-hidden border border-gray-100">
        <div className="absolute inset-0 border-t-4 border-[var(--puembo-green)] rounded-full animate-spin" />
        <Image
          src="/icons/church-icon.png"
          width={40}
          height={40}
          alt="Logo"
          className="relative opacity-80"
        />
      </div>
    </div>
    <div className="space-y-2 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--puembo-green)] animate-pulse">
        Preparando todo
      </p>
      <div className="flex gap-1 justify-center">
        <div className="w-1 h-1 bg-[var(--puembo-green)] rounded-full animate-bounce" />
        <div className="w-1 h-1 bg-[var(--puembo-green)] rounded-full animate-bounce [animation-delay:0.2s]" />
        <div className="w-1 h-1 bg-[var(--puembo-green)] rounded-full animate-bounce [animation-delay:0.4s]" />
      </div>
    </div>
  </div>
);

export const ErrorState = ({ type = "not_found" }) => (
  <div className="fixed inset-0 bg-[#FAFAFA] flex flex-col items-center justify-center p-8 text-center overflow-hidden">
    <div className="absolute top-[-10%] right-[-10%] w-[40%] aspect-square bg-[var(--puembo-green)]/5 rounded-full blur-3xl" />
    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] aspect-square bg-[var(--puembo-green)]/5 rounded-full blur-3xl" />

    <div className="relative z-10 max-w-md w-full">
      <div
        className={cn(
          "w-32 h-32 rounded-[2.5rem] flex items-center justify-center mb-8 mx-auto shadow-xl rotate-3",
          type === "inactive"
            ? "bg-amber-50 text-amber-500"
            : "bg-red-50 text-red-500",
        )}
      >
        {type === "inactive" ? (
          <Clock className="w-12 h-12 -rotate-3" />
        ) : (
          <AlertTriangle className="w-12 h-12 -rotate-3" />
        )}
      </div>
      <h1 className="text-3xl font-serif font-black text-gray-900 mb-4 leading-tight">
        {type === "inactive"
          ? "Este formulario ha cerrado sus puertas"
          : "Ups, no encontramos lo que buscas"}
      </h1>
      <p className="text-gray-500 text-lg font-light leading-relaxed mb-10">
        {type === "inactive"
          ? "Por el momento ya no recibimos más respuestas. Si necesitas ayuda, no dudes en contactarnos."
          : "Parece que el enlace es incorrecto o el formulario ya no está disponible."}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          className="rounded-full px-10 h-14 bg-black text-white hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 shadow-lg"
          onClick={() => (window.location.href = "/")}
        >
          Ir al inicio
        </Button>
        <Button
          variant="outline"
          className="rounded-full px-10 h-14 border-2 transition-all hover:bg-gray-50"
          onClick={() => window.history.back()}
        >
          Volver atrás
        </Button>
      </div>
    </div>
  </div>
);

export default function FormClient({ form, errorType }) {
  if (errorType) return <ErrorState type={errorType} />;
  if (!form) return <ErrorState type="not_found" />;

  return (
    <div className="min-h-screen bg-white/20 text-gray-900 font-sans selection:bg-[var(--puembo-green)]/20 selection:text-[var(--puembo-green)] relative overflow-x-hidden">
      <div className="fixed inset-0 opacity-100 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/45-degree-fabric-light.png')]" />
      <div className="relative z-10">
        <FluentRenderer form={form} />
      </div>
    </div>
  );
}
