"use client";

import { useState, useRef } from "react";
import { reprocessSubmissionWithReceipt } from "@/lib/actions/finance";
import { formatInEcuador } from "@/lib/date-utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Upload,
  AlertTriangle,
  FileImage,
  Phone,
  Calendar,
  User,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function groupByForm(submissions) {
  return submissions.reduce((acc, s) => {
    const key = s.formTitle || "Sin formulario";
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});
}

function SubmissionCard({ submission, onDone }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Selecciona un archivo primero");
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("formSlug", submission.formSlug);
    fd.append("submissionId", submission.id);
    fd.append("financialFieldLabel", submission.financialFieldLabel);

    const result = await reprocessSubmissionWithReceipt(fd);
    setUploading(false);

    if (result.error) {
      toast.error(`Error: ${result.error}`);
    } else {
      setDone(true);
      setOpen(false);
      toast.success(`Comprobante procesado para ${submission.name}`);
      onDone(submission.id);
    }
  };

  return (
    <>
      <div className={cn(
        "flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border transition-colors",
        done
          ? "bg-emerald-50/50 border-emerald-100"
          : "bg-white border-gray-100 hover:border-gray-200"
      )}>
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
            done ? "bg-emerald-100" : "bg-amber-50"
          )}>
            {done
              ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              : <AlertTriangle className="w-4 h-4 text-amber-500" />
            }
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-gray-900 truncate">{submission.name}</span>
              {submission.phone && (
                <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                  <Phone className="w-2.5 h-2.5" />{submission.phone}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                <Calendar className="w-2.5 h-2.5" />
                {formatInEcuador(submission.created_at, "d MMM yyyy, HH:mm")}
              </span>
              {submission.expectedFileName ? (
                <span className="text-[10px] text-blue-500 flex items-center gap-0.5 truncate max-w-[180px]">
                  <FileImage className="w-2.5 h-2.5 shrink-0" />
                  {submission.expectedFileName}
                </span>
              ) : (
                <span className="text-[10px] text-gray-300 italic">Sin archivo registrado</span>
              )}
            </div>
          </div>
        </div>

        {done ? (
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 shrink-0">
            Procesado
          </span>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 h-8 text-xs font-bold border-amber-200 text-amber-700 hover:bg-amber-50"
            onClick={() => setOpen(true)}
          >
            <Upload className="w-3 h-3 mr-1" />
            Subir
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-base font-black">Subir comprobante</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Para <span className="font-semibold text-gray-700">{submission.name}</span>
              {submission.expectedFileName && (
                <> — archivo esperado: <span className="font-mono text-blue-600">{submission.expectedFileName}</span></>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <label className={cn(
              "flex flex-col items-center justify-center gap-2 w-full h-32",
              "border-2 border-dashed rounded-2xl cursor-pointer transition-colors",
              "border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 bg-gray-50"
            )}>
              <FileImage className="w-6 h-6 text-gray-300" />
              <span className="text-[11px] font-medium text-gray-400">
                {fileRef.current?.files?.[0]?.name || "Haz clic para seleccionar el comprobante"}
              </span>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={() => setOpen(true)} // re-render label
              />
            </label>

            {!submission.financialFieldLabel && (
              <p className="text-[11px] text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Este formulario no tiene configurada la pregunta financiera. Configúrala antes de recuperar.
              </p>
            )}

            <Button
              className="w-full font-bold"
              disabled={uploading || !submission.financialFieldLabel}
              onClick={handleUpload}
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Procesando con IA...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" />Subir y procesar</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FormGroup({ title, submissions }) {
  const [expanded, setExpanded] = useState(true);
  const [items, setItems] = useState(submissions);

  const handleDone = (id) => {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, _done: true } : s)));
  };

  const pending = items.filter((s) => !s._done).length;

  return (
    <div className="rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm shadow-gray-100/50">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-6 py-4 bg-white hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-black text-sm text-gray-900">{title}</span>
          <span className={cn(
            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
            pending === 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          )}>
            {pending === 0 ? "Completo" : `${pending} pendiente${pending !== 1 ? "s" : ""}`}
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 bg-gray-50/30">
          {items.map((s) => (
            <SubmissionCard key={s.id} submission={s} onDone={handleDone} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RecoveryManager({ submissions }) {
  const grouped = groupByForm(submissions);

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 border-2 border-dashed border-gray-100 rounded-[2rem]">
        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        <p className="font-bold text-gray-500 text-sm">Todo al día</p>
        <p className="text-xs text-gray-400">No hay inscripciones financieras sin comprobante procesado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <User className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs text-gray-500">
          <span className="font-bold text-gray-700">{submissions.length}</span> inscripciones pendientes en{" "}
          <span className="font-bold text-gray-700">{Object.keys(grouped).length}</span> formularios
        </span>
      </div>

      {Object.entries(grouped).map(([formTitle, subs]) => (
        <FormGroup key={formTitle} title={formTitle} submissions={subs} />
      ))}
    </div>
  );
}
