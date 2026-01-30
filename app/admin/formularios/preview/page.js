"use client";

import { useState, useEffect } from "react";
import FluentRenderer from "@/components/public/forms/fluent-renderer/FluentRenderer";
import { Loader2, Monitor, Smartphone, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FormPreviewPage() {
  const [formConfig, setFormConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Recuperar la configuración temporal guardada por el Builder
    const savedConfig = sessionStorage.getItem("ap_form_preview_data");
    if (savedConfig) {
      try {
        setFormConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Error parsing preview config:", e);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--puembo-green)]" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Generando vista previa...
        </p>
      </div>
    );
  }

  if (!formConfig) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-[2rem] flex items-center justify-center mb-6">
          <Layout className="w-10 h-10 text-gray-300" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">No hay datos de vista previa</h1>
        <p className="text-gray-500 max-w-sm">Vuelve al editor y haz clic en &quot;Vista Previa&quot; para generar una visualización.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white/20 text-gray-900 font-sans selection:bg-[var(--puembo-green)]/20 selection:text-[var(--puembo-green)] relative overflow-x-hidden">
      {/* Banner de Aviso */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-blue-600 text-white py-2 px-4 flex items-center justify-center gap-4 shadow-lg">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 hidden sm:block" />
          <span className="text-[10px] font-black uppercase tracking-widest">Modo Vista Previa</span>
        </div>
        <div className="h-4 w-px bg-white/20 hidden sm:block" />
        <p className="text-[9px] font-medium opacity-90 hidden sm:block">Los cambios no guardados en el editor se reflejan aquí.</p>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-[9px] uppercase px-4 ml-auto"
          onClick={() => window.close()}
        >
          Cerrar Vista
        </Button>
      </div>

      {/* Texture overlay */}
      <div className="fixed inset-0 opacity-100 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/45-degree-fabric-light.png')]" />

      <div className="relative z-10 pt-12">
        <FluentRenderer form={formConfig} isPreview={true} />
      </div>
    </div>
  );
}
