'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MessageSquare, ShieldCheck, X, Save, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils.ts";

export default function PrayerRequestStatusDialog({ request, onStatusChange, onClose }) {
  const [selectedStatus, setSelectedStatus] = useState(request.status);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (selectedStatus !== request.status) {
      setLoading(true);
      await onStatusChange(request.id, selectedStatus);
      setLoading(false);
    } else {
      toast.info('No se realizaron cambios.');
    }
    onClose();
  };

  const statusOptions = [
    { value: 'pending', label: 'Pendiente', color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { value: 'approved', label: 'Aprobar para el Muro', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { value: 'rejected', label: 'Rechazar petición', color: 'bg-red-50 text-red-600 border-red-100' },
  ];

  return (
    <div className="space-y-10">
      {/* Contexto de la Petición */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-400">
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Contenido de la Petición</span>
        </div>
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
            <p className="text-gray-600 font-light italic leading-relaxed">"{request.request_text}"</p>
        </div>
      </div>

      {/* Selector de Estado */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Decisión Editorial</span>
        </div>
        
        <RadioGroup value={selectedStatus} onValueChange={setSelectedStatus} className="grid grid-cols-1 gap-3">
          {statusOptions.map((option) => (
            <Label
              key={option.value}
              htmlFor={`status-${option.value}`}
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                selectedStatus === option.value 
                    ? "bg-white border-[var(--puembo-green)] shadow-md ring-1 ring-[var(--puembo-green)]/20" 
                    : "bg-gray-50 border-gray-100 hover:border-gray-200"
              )}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value={option.value} id={`status-${option.value}`} className="border-gray-300 text-[var(--puembo-green)]" />
                <span className={cn(
                    "text-sm font-bold transition-colors",
                    selectedStatus === option.value ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700"
                )}>
                    {option.label}
                </span>
              </div>
              {selectedStatus === option.value && (
                  <Badge className={cn("rounded-full border text-[10px] uppercase tracking-tighter", option.color)}>Actual</Badge>
              )}
            </Label>
          ))}
        </RadioGroup>
      </div>

      {/* Footer Acciones */}
      <div className="flex justify-end gap-4 pt-8 border-t border-gray-50">
        <Button variant="ghost" onClick={onClose} className="rounded-full px-8 text-gray-400" disabled={loading}>
            <X className="w-4 h-4 mr-2" /> Cancelar
        </Button>
        <Button onClick={handleSave} variant="green" disabled={loading} className="rounded-full px-10 py-6 font-bold shadow-lg shadow-[var(--puembo-green)]/20 hover:-translate-y-0.5 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {loading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </div>
  );
}