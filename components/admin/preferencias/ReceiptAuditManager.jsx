"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, FileSearch, Loader2, Play, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { runReceiptAuditAction } from "@/lib/actions/receipt-audit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function StatusBadge({ label, tone = "neutral" }) {
  const tones = {
    neutral: "bg-gray-100 text-gray-700",
    success: "bg-emerald-100 text-emerald-700",
    warn: "bg-amber-100 text-amber-800",
    error: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${tones[tone]}`}>
      {label}
    </span>
  );
}

function toneForStatus(status) {
  if (status === "valid") return "success";
  if (status === "manual_review") return "warn";
  if (status === "invalid" || status === "error") return "error";
  return "neutral";
}

export default function ReceiptAuditManager() {
  const [audit, setAudit] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleRun = () => {
    startTransition(async () => {
      try {
        const result = await runReceiptAuditAction();
        setAudit(result);
        toast.success("Auditoría ejecutada");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo ejecutar la auditoría");
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white">
              <FileSearch className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-black">Auditar comprobantes</CardTitle>
              <CardDescription>
                Ejecuta la lógica real de producción sobre <span className="font-mono text-xs">/comprobantes</span>.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Esta vista usa el extractor y el clasificador reales. No compara reglas viejas vs nuevas.
          </div>

          <Button variant="green" className="font-bold" onClick={handleRun} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Ejecutando
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Ejecutar auditoría
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {audit ? (
        <>
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-black">Resumen</CardTitle>
              <CardDescription>
                Generado: {audit.auditedAt}
                <br />
                Carpeta: <span className="font-mono text-xs">{audit.directory}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex flex-wrap gap-2">
                {Object.entries(audit.summary).map(([status, count]) => (
                  <StatusBadge key={status} label={`${status} ${count}`} tone={toneForStatus(status)} />
                ))}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-700">
                <div className="mb-1 flex items-center gap-2 font-black uppercase tracking-widest text-gray-500">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Cuenta evaluada
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap break-words">
                  {JSON.stringify(audit.destinationAccount, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {audit.results.map((result) => (
              <Card key={result.fileName} className="border-gray-200 shadow-sm">
                <CardHeader className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-sm font-black">{result.fileName}</CardTitle>
                    <StatusBadge label={result.mimeType ?? "sin mime"} tone="info" />
                    <StatusBadge label={result.status} tone={toneForStatus(result.status)} />
                    {result.transientFailure ? <StatusBadge label="Gemini temporal" tone="warn" /> : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {result.status === "error" ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                      <div className="mb-1 flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Error
                      </div>
                      {result.reason}
                    </div>
                  ) : (
                    <>
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                        <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                          Resultado
                        </div>
                        <div className="font-semibold text-gray-900">{result.status}</div>
                        <div className="text-xs text-gray-600">{result.reason || "Sin motivo adicional"}</div>
                      </div>

                      {result.beneficiaryMatch ? (
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                          <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                            Match de cuenta
                          </div>
                          <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-gray-700">
                            {JSON.stringify(result.beneficiaryMatch, null, 2)}
                          </pre>
                        </div>
                      ) : null}

                      <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                        <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                          Datos extraídos
                        </div>
                        <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-gray-700">
                          {JSON.stringify(result.extractedData, null, 2)}
                        </pre>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
