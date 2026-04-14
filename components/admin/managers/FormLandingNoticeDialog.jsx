"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, ClipboardList } from "lucide-react";

const NOTICE_STORAGE_KEY = "admin_forms_notice_last_seen";
const NOTICE_TTL_MS = 2 * 60 * 60 * 1000;

export function FormLandingNoticeDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const lastSeenRaw = window.localStorage.getItem(NOTICE_STORAGE_KEY);
      const lastSeen = lastSeenRaw ? Number(lastSeenRaw) : 0;
      const shouldShow = !lastSeen || Date.now() - lastSeen >= NOTICE_TTL_MS;

      if (shouldShow) {
        setOpen(true);
        window.localStorage.setItem(NOTICE_STORAGE_KEY, String(Date.now()));
      }
    } catch {
      setOpen(true);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        hideClose
        overlayClassName="bg-black/60 backdrop-blur-sm"
        className="rounded-[2rem] border-none bg-white p-8 shadow-2xl sm:max-w-[520px]"
      >
        <DialogHeader className="space-y-3 text-left">
          <Badge className="w-fit rounded-full bg-red-500 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-sm hover:bg-red-600">
            Atención
          </Badge>
          <DialogTitle className="text-2xl font-serif font-bold text-gray-900">
            Desde ahora ya no usamos Google para formularios.
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-gray-500">
            Todo el flujo vive dentro del panel. Usa <strong>Analíticas</strong> para abrir cada formulario, revisar su estado y <strong>descargar el Excel</strong>. Usa <strong>Inscripciones</strong> para buscar registros y ver la recaudación por inscrito.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 grid gap-3">
          <DialogClose asChild>
            <Button asChild variant="green" className="h-auto w-full justify-start gap-3 rounded-[1.2rem] px-4 py-4">
              <Link href="/admin/formularios#forms-table">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <BarChart3 className="h-4 w-4" />
                </span>
                <span className="flex flex-col items-start text-left">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                    Analíticas por formulario
                  </span>
                  <span className="text-sm font-medium text-white/90">
                    Abrir el listado de formularios
                  </span>
                </span>
              </Link>
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              asChild
              variant="outline"
              className="h-auto w-full justify-start gap-3 rounded-[1.2rem] border-gray-200 px-4 py-4"
            >
              <Link href="/admin/formularios/inscripciones">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                  <ClipboardList className="h-4 w-4" />
                </span>
                <span className="flex flex-col items-start text-left">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
                    Inscripciones
                  </span>
                  <span className="text-sm font-medium text-gray-500">
                    Buscar registros y recaudación
                  </span>
                </span>
              </Link>
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
