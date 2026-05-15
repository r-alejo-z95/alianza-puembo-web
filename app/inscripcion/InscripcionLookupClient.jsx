"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestSubmissionTrackingLinks } from "@/lib/actions";
import { cn } from "@/lib/utils";

const inputClass = "h-12 min-w-0 rounded-2xl bg-gray-50/70 border-gray-100 font-medium focus:bg-white";

function extractToken(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  try {
    const url = new URL(raw);
    const parts = url.pathname.split("/").filter(Boolean);
    const index = parts.findIndex((part) => part === "inscripcion");
    if (index >= 0 && parts[index + 1]) return parts[index + 1];
  } catch {
    // Not a full URL; treat it as a token or path below.
  }

  return raw
    .replace(/^https?:\/\/[^/]+/i, "")
    .split("/")
    .filter(Boolean)
    .pop() || raw;
}

export default function InscripcionLookupClient() {
  const router = useRouter();
  const [tokenValue, setTokenValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [emailResult, setEmailResult] = useState(null);

  const handleTokenSubmit = (event) => {
    event.preventDefault();
    const token = extractToken(tokenValue);

    if (!token || token.length < 12 || token.includes(" ")) {
      setTokenError("Pega un token o enlace de seguimiento válido.");
      return;
    }

    setTokenError("");
    router.push(`/inscripcion/${encodeURIComponent(token)}`);
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    setIsSendingEmail(true);
    setEmailResult(null);

    try {
      const result = await requestSubmissionTrackingLinks(emailValue);
      setEmailResult(result.outcome || {
        status: result.error ? "error" : "success",
        title: result.error ? "No pudimos procesar el correo" : "Revisa tu correo",
        message: result.error || "Si encontramos inscripciones activas, enviaremos los enlaces.",
        steps: [],
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto overflow-hidden px-4 sm:px-5">
      <div className="flex justify-center mb-10 md:mb-12">
        <Link href="/">
          <Image src="/brand/logo-puembo.png" width={180} height={60} alt="Alianza Puembo" className="h-12 w-auto" />
        </Link>
      </div>

      <header className="text-center max-w-3xl mx-auto space-y-5 mb-10 md:mb-14">
        <div className="flex min-w-0 items-center justify-center gap-3 md:gap-4">
          <div className="h-px w-8 shrink md:w-14 bg-[var(--puembo-green)]/60" />
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.45em] text-[var(--puembo-green)]">
            Seguimiento
          </span>
          <div className="h-px w-8 shrink md:w-14 bg-[var(--puembo-green)]/60" />
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-black leading-tight text-gray-900">
          Inscripciones y abonos
        </h1>
        <p className="text-base md:text-lg text-gray-500 leading-relaxed font-medium">
          Usa tu token para consultar el estado de tu inscripción, revisar pagos y subir comprobantes adicionales sin llenar el formulario otra vez.
        </p>
      </header>

      <div className="relative mb-8 md:mb-12">
        <div className="relative aspect-[16/7] min-h-[220px] overflow-hidden rounded-[2rem] md:rounded-[3rem] shadow-2xl">
          <Image
            src="/eventos/upcoming-events-intro.avif"
            alt="Comunidad Alianza Puembo"
            fill
            sizes="(max-width: 768px) 100vw, 1100px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 text-white">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[var(--puembo-green)]" />
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--puembo-green)]">
                  Portal privado
                </p>
              </div>
              <p className="text-sm md:text-base font-medium text-white/85 leading-relaxed">
                Guarda tu enlace de seguimiento. Desde ahí puedes subir abonos futuros y evitar duplicar tu inscripción.
              </p>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-4 left-6 right-6 h-px bg-[var(--puembo-green)]/30" />
      </div>

      <section className="grid min-w-0 grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 items-start">
        <form onSubmit={handleTokenSubmit} className="min-w-0 rounded-2xl md:rounded-3xl bg-white p-6 md:p-8 shadow-lg border border-gray-100">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[var(--puembo-green)]/10 text-[var(--puembo-green)] flex items-center justify-center shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-serif font-black text-gray-900">Tengo mi token o enlace</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">
                Pega el token o el enlace completo que recibiste por correo.
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col sm:flex-row gap-3">
            <Input
              value={tokenValue}
              onChange={(event) => setTokenValue(event.target.value)}
              placeholder="d2c74f03a40e..."
              className={cn(inputClass, "sm:flex-1")}
            />
            <Button type="submit" className="h-12 w-full sm:w-auto rounded-2xl px-6 bg-black hover:bg-gray-800 text-white font-black uppercase tracking-widest text-[10px] gap-2">
              Abrir
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          {tokenError ? (
            <p className="mt-3 text-xs font-bold text-red-500">{tokenError}</p>
          ) : null}
        </form>

        <form onSubmit={handleEmailSubmit} className="min-w-0 rounded-2xl md:rounded-3xl bg-white p-6 md:p-8 shadow-lg border border-gray-100">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[var(--puembo-green)]/10 text-[var(--puembo-green)] flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-serif font-black text-gray-900">No encuentro mi enlace</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">
                Te enviaremos los enlaces activos si encontramos inscripciones con ese correo.
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col sm:flex-row gap-3">
            <Input
              type="email"
              value={emailValue}
              onChange={(event) => setEmailValue(event.target.value)}
              placeholder="tu-correo@ejemplo.com"
              className={cn(inputClass, "sm:flex-1")}
            />
            <Button type="submit" disabled={isSendingEmail} className="h-12 w-full sm:w-auto rounded-2xl px-6 bg-[var(--puembo-green)] hover:bg-[var(--puembo-green)]/90 text-white font-black uppercase tracking-widest text-[10px] gap-2">
              {isSendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Enviar
            </Button>
          </div>

          {emailResult ? (
            <div
              className={cn(
                "mt-5 rounded-2xl border p-4",
                emailResult.status === "error"
                  ? "border-red-100 bg-red-50 text-red-700"
                  : "border-[var(--puembo-green)]/20 bg-[var(--puembo-green)]/5 text-gray-700",
              )}
            >
              <div className="flex gap-3">
                <CheckCircle2 className={cn("w-5 h-5 shrink-0 mt-0.5", emailResult.status === "error" ? "text-red-500" : "text-[var(--puembo-green)]")} />
                <div className="space-y-1">
                  <p className="text-sm font-black">{emailResult.title}</p>
                  <p className="text-xs leading-relaxed font-medium">{emailResult.message}</p>
                </div>
              </div>
            </div>
          ) : null}
        </form>
      </section>
    </div>
  );
}
