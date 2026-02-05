"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  UploadCloud, 
  FileImage, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  History,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadExternalReceipt } from "@/lib/actions/finance";
import { toast } from "sonner";

export function LegacyImportTool({ activityName, onImportSuccess }) {
  const [registrantName, setRegistrantName] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!activityName || !file || !registrantName) {
      toast.error("Datos incompletos.");
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadExternalReceipt(activityName, file, registrantName);
      if (res.success) {
        toast.success("Comprobante externo importado");
        setFile(null);
        setPreview(null);
        setRegistrantName("");
        if (onImportSuccess) onImportSuccess();
      } else {
        toast.error(res.error || "Error al subir");
      }
    } catch (e) {
      toast.error("Error inesperado");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden animate-in zoom-in-95 duration-500">
      <div className="p-6 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-base text-gray-900 leading-tight">Anexar Comprobante</h4>
            <p className="text-[8px] uppercase tracking-widest font-black text-amber-600">{activityName}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="space-y-2">
          <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Nombre de la Persona</Label>
          <Input 
            placeholder="Ej: Juan Pérez" 
            className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold text-sm"
            value={registrantName}
            onChange={(e) => setRegistrantName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Imagen de la Transferencia</Label>
          <div 
            className={cn(
              "border-2 border-dashed rounded-2xl min-h-[140px] flex flex-col items-center justify-center transition-all relative overflow-hidden",
              file ? "border-amber-200 bg-amber-50/20" : "border-gray-100 hover:border-amber-200 hover:bg-gray-50"
            )}
            onClick={() => !file && document.getElementById('external-receipt').click()}
          >
            {preview ? (
              <div className="relative w-full h-full p-2 flex flex-col items-center gap-2">
                <img src={preview} alt="Preview" className="max-h-[100px] rounded-lg shadow-sm object-contain" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full text-red-500"
                  onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                >&times;</Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 cursor-pointer">
                <UploadCloud className="w-8 h-8 text-gray-200" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cargar Foto</p>
              </div>
            )}
            <input id="external-receipt" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        </div>

        <Button 
          className={cn(
            "w-full h-14 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] shadow-lg transition-all",
            file && registrantName ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-gray-100 text-gray-300 cursor-not-allowed shadow-none"
          )}
          disabled={isUploading || !file}
          onClick={handleUpload}
        >
          {isUploading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Importar y Analizar IA
        </Button>
      </div>
    </Card>
  );
}