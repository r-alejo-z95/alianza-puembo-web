"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CircleDollarSign,
  KeyRound,
  Loader2,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import TurnstileCaptcha from "@/components/shared/TurnstileCaptcha";
import { requestPublicFormSubmissionLookup } from "@/lib/actions/public-form-lookup";
import { filterPublicFormListings } from "@/lib/forms/public-portal.mjs";
import { cn } from "@/lib/utils";

const inputClassName =
  "h-12 rounded-2xl border-black/10 bg-white px-5 font-medium shadow-none placeholder:text-gray-400 focus-visible:border-[var(--puembo-green)] focus-visible:ring-[var(--puembo-green)]/20";

function extractToken(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  try {
    const url = new URL(raw);
    const parts = url.pathname.split("/").filter(Boolean);
    const index = parts.findIndex((part) => part === "inscripcion");
    if (index >= 0 && parts[index + 1]) return parts[index + 1];
  } catch {
    // A raw token or relative path is valid input below.
  }

  return (
    raw
      .replace(/^https?:\/\/[^/]+/i, "")
      .split("/")
      .filter(Boolean)
      .pop() || raw
  );
}

function FormCard({ form }) {
  return (
    <article className="group flex min-h-full flex-col overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_18px_60px_rgba(25,27,24,0.07)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(25,27,24,0.12)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#20241f]">
        {form.image_url ? (
          <Image
            src={form.image_url}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 overflow-hidden bg-[#20241f]">
            <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-[var(--puembo-green)]/80 blur-[2px]" />
            <div className="absolute -bottom-20 -left-16 h-52 w-52 rounded-full border-[32px] border-white/10" />
            <Image
              src="/brand/iso-white.png"
              alt=""
              width={64}
              height={64}
              className="absolute bottom-6 right-6 h-12 w-auto opacity-90"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-gray-900 backdrop-blur">
            <BadgeCheck className="h-3.5 w-3.5 text-[var(--puembo-green)]" />
            Inscripción abierta
          </span>
          {form.is_financial ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-white backdrop-blur">
              <CircleDollarSign className="h-3.5 w-3.5 text-[var(--puembo-green)]" />
              Con pago
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 md:p-7">
        <h3 className="font-serif text-2xl font-black leading-tight text-[#20241f]">
          {form.title}
        </h3>
        <p className="mt-3 flex-1 text-sm font-medium leading-6 text-gray-500">
          {form.summary}
        </p>
        <Link
          href={`/formularios/${form.slug}`}
          className="mt-6 inline-flex items-center justify-between rounded-full bg-[#20241f] px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-[var(--puembo-green)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--puembo-green)] focus-visible:ring-offset-2"
        >
          Ver formulario
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

function PortalEmptyState({ children }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-black/15 bg-white/60 px-6 py-16 text-center">
      <Sparkles className="mx-auto h-7 w-7 text-[var(--puembo-green)]" />
      <p className="mx-auto mt-4 max-w-md font-serif text-xl font-bold text-gray-800">
        {children}
      </p>
    </div>
  );
}

export default function InscriptionPortal({ catalogForms, lookupForms }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialView =
    searchParams.get("vista") === "consulta" ? "consulta" : "catalogo";
  const [activeView, setActiveView] = useState(initialView);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [lookupQuery, setLookupQuery] = useState("");
  const [selectedFormId, setSelectedFormId] = useState("");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [tokenValue, setTokenValue] = useState("");
  const [tokenError, setTokenError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outcome, setOutcome] = useState(null);

  const filteredCatalogForms = useMemo(
    () => filterPublicFormListings(catalogForms, catalogQuery),
    [catalogForms, catalogQuery],
  );
  const filteredLookupForms = useMemo(
    () => filterPublicFormListings(lookupForms, lookupQuery),
    [lookupForms, lookupQuery],
  );
  const selectedForm = lookupForms.find(
    (form) => form.id === selectedFormId,
  );

  const handleViewChange = (value) => {
    setActiveView(value);
    router.replace(
      value === "consulta" ? "/inscripcion?vista=consulta" : "/inscripcion",
      { scroll: false },
    );
  };

  const handleLookupSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setOutcome(null);

    try {
      const result = await requestPublicFormSubmissionLookup({
        formId: selectedFormId,
        email,
        turnstileToken,
      });

      setOutcome(
        result.outcome || {
          status: "error",
          title: "No pudimos completar la consulta",
          message:
            result.error || "Ocurrió un error inesperado. Intenta nuevamente.",
        },
      );
    } catch {
      setOutcome({
        status: "error",
        title: "No pudimos completar la consulta",
        message: "Revisa tu conexión e intenta nuevamente.",
      });
    } finally {
      setTurnstileToken(null);
      setCaptchaKey((current) => current + 1);
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <header className="relative overflow-hidden rounded-[2.25rem] bg-[#20241f] px-6 py-12 text-white md:rounded-[3rem] md:px-12 md:py-16 lg:px-16">
        <div className="absolute -right-24 -top-36 h-[28rem] w-[28rem] rounded-full bg-[var(--puembo-green)] opacity-90" />
        <div className="absolute -bottom-36 right-48 h-72 w-72 rounded-full border-[46px] border-white/5" />
        <div className="relative max-w-3xl">
          <div className="flex items-center gap-3 text-[var(--puembo-green)]">
            <span className="h-px w-10 bg-current" />
            <span className="text-[10px] font-black uppercase tracking-[0.35em]">
              Inscripciones
            </span>
          </div>
          <h1 className="mt-6 max-w-2xl font-serif text-4xl font-black leading-[1.08] tracking-tight md:text-6xl">
            Encuentra tu próximo paso
          </h1>
          <p className="mt-5 max-w-xl text-base font-medium leading-7 text-white/70 md:text-lg">
            Explora las actividades abiertas o consulta una inscripción que ya
            realizaste.
          </p>
        </div>
      </header>

      <Tabs
        value={activeView}
        onValueChange={handleViewChange}
        className="mt-8 gap-8 md:mt-10"
      >
        <TabsList className="grid h-auto w-full grid-cols-2 rounded-[1.35rem] border border-black/5 bg-white p-1.5 shadow-[0_12px_40px_rgba(25,27,24,0.08)] md:mx-auto md:max-w-xl">
          <TabsTrigger
            value="catalogo"
            className="h-12 rounded-2xl px-3 text-xs font-black data-[state=active]:bg-[#20241f] data-[state=active]:text-white data-[state=active]:shadow-none md:text-sm"
          >
            Quiero inscribirme
          </TabsTrigger>
          <TabsTrigger
            value="consulta"
            className="h-12 rounded-2xl px-3 text-xs font-black data-[state=active]:bg-[#20241f] data-[state=active]:text-white data-[state=active]:shadow-none md:text-sm"
          >
            Ya me inscribí
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalogo" className="space-y-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--puembo-green)]">
                Inscripciones abiertas
              </p>
              <h2 className="mt-2 font-serif text-3xl font-black text-[#20241f] md:text-4xl">
                Elige dónde participar
              </h2>
            </div>
            <div className="relative w-full md:max-w-md">
              <label htmlFor="catalog-search" className="sr-only">
                Buscar inscripciones
              </label>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="catalog-search"
                type="search"
                value={catalogQuery}
                onChange={(event) => setCatalogQuery(event.target.value)}
                placeholder="Buscar inscripciones"
                className={cn(inputClassName, "pl-11")}
              />
            </div>
          </div>

          {catalogForms.length === 0 ? (
            <PortalEmptyState>
              No hay inscripciones abiertas en este momento.
            </PortalEmptyState>
          ) : filteredCatalogForms.length === 0 ? (
            <PortalEmptyState>
              No encontramos inscripciones con ese nombre.
            </PortalEmptyState>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredCatalogForms.map((form) => (
                <FormCard key={form.id} form={form} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="consulta" className="space-y-7">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--puembo-green)]">
              Consulta privada
            </p>
            <h2 className="mt-2 font-serif text-3xl font-black text-[#20241f] md:text-4xl">
              Verifica tu inscripción
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-6 text-gray-500 md:text-base">
              Selecciona el formulario y usa el mismo correo de tu registro. Te
              enviaremos el resultado sin mostrar información personal aquí.
            </p>
          </div>

          <div className="grid overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_22px_70px_rgba(25,27,24,0.08)] lg:grid-cols-[0.9fr_1.1fr] lg:rounded-[2.5rem]">
            <div className="border-b border-black/5 bg-[#f0f0e9] p-6 md:p-8 lg:border-b-0 lg:border-r">
              <label
                htmlFor="lookup-search"
                className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500"
              >
                Buscar el formulario
              </label>
              <div className="relative mt-3">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="lookup-search"
                  type="search"
                  value={lookupQuery}
                  onChange={(event) => setLookupQuery(event.target.value)}
                  placeholder="Escribe el nombre"
                  className={cn(inputClassName, "pl-11")}
                />
              </div>

              <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
                {filteredLookupForms.length ? (
                  filteredLookupForms.map((form) => (
                    <button
                      type="button"
                      key={form.id}
                      onClick={() => {
                        setSelectedFormId(form.id);
                        setOutcome(null);
                      }}
                      className={cn(
                        "w-full rounded-2xl border px-4 py-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--puembo-green)]",
                        selectedFormId === form.id
                          ? "border-[var(--puembo-green)] bg-white shadow-sm"
                          : "border-transparent bg-white/55 hover:border-black/10 hover:bg-white",
                      )}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="text-sm font-black leading-5 text-gray-800">
                          {form.title}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-widest",
                            form.enabled
                              ? "bg-[var(--puembo-green)]/15 text-[#49751d]"
                              : "bg-black/8 text-gray-500",
                          )}
                        >
                          {form.enabled ? "Abierto" : "Cerrado"}
                        </span>
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="rounded-2xl bg-white/60 p-4 text-center text-xs font-bold text-gray-500">
                    No encontramos formularios con ese nombre.
                  </p>
                )}
              </div>
            </div>

            <form onSubmit={handleLookupSubmit} className="p-6 md:p-8 lg:p-10">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--puembo-green)]/12 text-[var(--puembo-green)]">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Formulario seleccionado
                  </p>
                  <h3 className="mt-1 font-serif text-xl font-black text-gray-900">
                    {selectedForm?.title || "Selecciona uno de la lista"}
                  </h3>
                </div>
              </div>

              <div className="mt-7 space-y-3">
                <label
                  htmlFor="lookup-email"
                  className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500"
                >
                  Correo usado al inscribirte
                </label>
                <Input
                  id="lookup-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tu-correo@ejemplo.com"
                  className={inputClassName}
                />
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-gray-50 p-3">
                <TurnstileCaptcha
                  key={captchaKey}
                  onVerify={setTurnstileToken}
                />
              </div>

              <Button
                type="submit"
                disabled={
                  !selectedFormId ||
                  !email.trim() ||
                  !turnstileToken ||
                  isSubmitting
                }
                className="mt-6 h-12 w-full rounded-full bg-[var(--puembo-green)] text-[10px] font-black uppercase tracking-[0.18em] text-white hover:bg-[#74a938] disabled:opacity-45"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Consultar por correo
              </Button>

              {outcome ? (
                <div
                  role="status"
                  className={cn(
                    "mt-5 rounded-2xl border p-4",
                    outcome.status === "error"
                      ? "border-red-100 bg-red-50 text-red-700"
                      : "border-[var(--puembo-green)]/25 bg-[var(--puembo-green)]/8 text-gray-700",
                  )}
                >
                  <div className="flex gap-3">
                    <CheckCircle2
                      className={cn(
                        "mt-0.5 h-5 w-5 shrink-0",
                        outcome.status === "error"
                          ? "text-red-500"
                          : "text-[var(--puembo-green)]",
                      )}
                    />
                    <div>
                      <p className="text-sm font-black">{outcome.title}</p>
                      <p className="mt-1 text-xs font-medium leading-5">
                        {outcome.message}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </form>
          </div>

          <form
            onSubmit={handleTokenSubmit}
            className="mx-auto max-w-3xl rounded-[2rem] border border-black/5 bg-[#20241f] p-6 text-white md:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[var(--puembo-green)]">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-black">
                  Tengo mi token o enlace
                </h3>
                <p className="mt-1 text-sm font-medium leading-6 text-white/60">
                  Abre directamente el seguimiento financiero que recibiste por
                  correo.
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Input
                value={tokenValue}
                onChange={(event) => setTokenValue(event.target.value)}
                placeholder="Pega aquí tu token o enlace"
                className="h-12 min-w-0 flex-1 rounded-2xl border-white/10 bg-white/10 px-5 font-medium text-white placeholder:text-white/35 focus-visible:border-[var(--puembo-green)] focus-visible:ring-[var(--puembo-green)]/20"
              />
              <Button
                type="submit"
                className="h-12 rounded-2xl bg-white px-6 text-[10px] font-black uppercase tracking-[0.18em] text-[#20241f] hover:bg-[var(--puembo-green)] hover:text-white"
              >
                Abrir seguimiento
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            {tokenError ? (
              <p className="mt-3 text-xs font-bold text-red-300">
                {tokenError}
              </p>
            ) : null}
          </form>

          <div className="flex items-center justify-center gap-2 text-center text-xs font-bold text-gray-400">
            <ShieldCheck className="h-4 w-4 text-[var(--puembo-green)]" />
            Tus resultados sólo se envían al correo consultado.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
