"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Copy, Download, Link2, Loader2, Pencil, QrCode, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useScreenSize } from "@/lib/hooks/useScreenSize";
import { updateFormShortCode } from "@/lib/actions/forms";
import {
  getFormShortUrl,
  isValidFormShortCode,
  normalizeFormShortCode,
} from "@/lib/forms/short-links.mjs";
import { cn } from "@/lib/utils";

export function FormShareTools({ form }) {
  const { isLg } = useScreenSize();
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState("");
  const [shortCode, setShortCode] = useState(form.short_code || "");
  const [draftCode, setDraftCode] = useState(form.short_code || "");
  const [qrSvg, setQrSvg] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    setShortCode(form.short_code || "");
    setDraftCode(form.short_code || "");
  }, [form.short_code]);

  const shortUrl = useMemo(() => {
    if (!origin || !shortCode) return "";
    return getFormShortUrl(shortCode, origin);
  }, [origin, shortCode]);

  useEffect(() => {
    let cancelled = false;

    async function renderQr() {
      if (!open || !shortUrl) return;
      setIsGeneratingQr(true);
      try {
        const svg = await QRCode.toString(shortUrl, {
          type: "svg",
          width: 280,
          margin: 1,
          color: {
            dark: "#111827",
            light: "#ffffff",
          },
        });
        if (!cancelled) setQrSvg(svg);
      } catch (error) {
        if (!cancelled) toast.error("No se pudo generar el QR.");
      } finally {
        if (!cancelled) setIsGeneratingQr(false);
      }
    }

    renderQr();
    return () => {
      cancelled = true;
    };
  }, [open, shortUrl]);

  const copyShortUrl = async () => {
    if (!shortUrl) return;
    await navigator.clipboard.writeText(shortUrl);
    toast.success("Link corto copiado");
  };

  const saveShortCode = async () => {
    const normalized = normalizeFormShortCode(draftCode);
    if (!isValidFormShortCode(normalized)) {
      toast.error("Usa 3 a 40 caracteres: letras minúsculas, números y guiones.");
      return;
    }

    setIsSaving(true);
    const result = await updateFormShortCode(form.id, normalized);
    setIsSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setShortCode(result.shortCode);
    setDraftCode(result.shortCode);
    toast.success("Link corto actualizado");
  };

  const downloadSvg = () => {
    if (!qrSvg || !shortCode) return;
    const blob = new Blob([qrSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${shortCode}-qr.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = async () => {
    if (!shortUrl || !shortCode) return;
    const dataUrl = await QRCode.toDataURL(shortUrl, {
      width: 1024,
      margin: 2,
      color: {
        dark: "#111827",
        light: "#ffffff",
      },
    });
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = `${shortCode}-qr.png`;
    anchor.click();
  };

  const shareContent = (
    <div className="space-y-6 p-5 sm:p-8">
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
          Link corto
        </Label>
        <div className="flex min-w-0 gap-2">
          <div className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 text-sm font-semibold text-gray-700">
            <Link2 className="h-4 w-4 shrink-0 text-[var(--puembo-green)]" />
            <span className="block min-w-0 truncate">{shortUrl || "Genera un link corto"}</span>
          </div>
          <Button type="button" onClick={copyShortUrl} disabled={!shortUrl} className="h-12 w-12 shrink-0 rounded-xl p-0">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`short-code-${form.id}`} className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
          Codigo editable
        </Label>
        <div className="flex min-w-0 gap-2">
          <div className="relative min-w-0 flex-1">
            <Pencil className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id={`short-code-${form.id}`}
              value={draftCode}
              onChange={(event) => setDraftCode(normalizeFormShortCode(event.target.value))}
              className="h-12 rounded-xl border-gray-100 pl-11 font-mono text-sm"
              placeholder="ret-fin-int"
            />
          </div>
          <Button type="button" onClick={saveShortCode} disabled={isSaving} className="h-12 w-12 shrink-0 rounded-xl p-0">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
        <div
          className={cn(
            "flex h-[240px] w-[240px] items-center justify-center rounded-xl bg-white sm:h-[280px] sm:w-[280px]",
            isGeneratingQr && "bg-gray-50",
          )}
        >
          {isGeneratingQr ? (
            <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
          ) : qrSvg ? (
            <div className="h-full w-full [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: qrSvg }} />
          ) : (
            <QrCode className="h-10 w-10 text-gray-300" />
          )}
        </div>

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          <Button type="button" variant="outline" onClick={downloadSvg} disabled={!qrSvg} className="rounded-xl">
            <Download className="mr-2 h-4 w-4" />
            Descargar SVG
          </Button>
          <Button type="button" variant="outline" onClick={downloadPng} disabled={!shortUrl} className="rounded-xl">
            <Download className="mr-2 h-4 w-4" />
            Descargar PNG
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Link corto y QR"
        onClick={() => setOpen(true)}
        className="h-11 w-full flex-none rounded-xl text-[var(--puembo-green)] transition-all duration-300 hover:bg-[var(--puembo-green)]/10 lg:h-9 lg:w-9 lg:text-black lg:hover:text-[var(--puembo-green)]"
      >
        <QrCode className="w-4 h-4" />
      </Button>

      {isLg ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="flex max-h-[min(680px,calc(100dvh-4rem))] w-[520px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[2rem] border-none p-0 shadow-2xl sm:max-w-none">
            <div className="shrink-0 bg-gray-950 px-8 py-7 text-white">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">Compartir formulario</DialogTitle>
                <DialogDescription className="text-gray-300">
                  Usa este link corto para WhatsApp, anuncios y material impreso.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {shareContent}
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[92vh] flex flex-col z-[400] bg-black overflow-hidden border-none p-0">
            <div className="shrink-0 bg-black px-6 pb-4 pt-5 text-white relative">
              <DrawerHeader className="space-y-2 p-0 text-left">
                <div className="flex items-center gap-3">
                  <div className="h-px w-6 bg-[var(--puembo-green)]" />
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                    Compartir
                  </span>
                </div>
                <DrawerTitle className="font-serif text-xl font-bold leading-tight text-white">
                  Link y QR
                </DrawerTitle>
                <DrawerDescription className="text-[10px] font-light leading-relaxed text-gray-400">
                  Usa este link corto para WhatsApp, anuncios y material impreso.
                </DrawerDescription>
              </DrawerHeader>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-[var(--puembo-green)]/40 via-[var(--puembo-green)]/10 to-transparent" />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-[#F8F9FA]">
              {shareContent}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
