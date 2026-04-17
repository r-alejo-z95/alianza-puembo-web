"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { findNameInSubmission } from "@/lib/form-utils";

export function DiscardReceiptDialog({
  open,
  onOpenChange,
  payment,
  submissions,
  onConfirm,
  isSubmitting,
}) {
  const [reason, setReason] = useState("incorrecto");
  const [notes, setNotes] = useState("");
  const [coveredBySubmissionId, setCoveredBySubmissionId] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("incorrecto");
      setNotes("");
      setCoveredBySubmissionId("");
    }
  }, [open]);

  const options = useMemo(
    () =>
      (submissions || []).filter((submission) => {
        if (!payment?.submission?.id) return true;
        return submission.id !== payment.submission.id;
      }),
    [payment, submissions],
  );

  const handleConfirm = () => {
    onConfirm?.({
      reason,
      notes,
      coveredBySubmissionId: reason === "duplicado" ? coveredBySubmissionId : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-[2rem] border-none p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif font-bold">Descartar comprobante</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Motivo</p>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="incorrecto">Comprobante incorrecto</SelectItem>
                <SelectItem value="duplicado">Duplicado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reason === "duplicado" && (
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Inscripción principal</p>
              <Select value={coveredBySubmissionId} onValueChange={setCoveredBySubmissionId}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Selecciona la inscripción que conserva el pago" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((submission) => (
                    <SelectItem key={submission.id} value={submission.id}>
                      {findNameInSubmission(submission)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Notas</p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Observaciones opcionales..."
              className="rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting || (reason === "duplicado" && !coveredBySubmissionId)}
              className="rounded-full"
            >
              {isSubmitting ? "Guardando..." : "Descartar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
