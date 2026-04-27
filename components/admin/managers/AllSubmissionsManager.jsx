"use client";

import React, { useState, useMemo } from "react";
import { useScreenSize } from "@/lib/hooks/useScreenSize";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Search,
  X,
  ExternalLink,
  Copy,
  Check,
  Filter,
  ChevronDown,
  Ticket,
  Users,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { findNameInSubmission } from "@/lib/form-utils";
import {
  getDisplayedSubmissionAmount,
  getFinanceDisplayState,
  getRevenueContribution,
} from "@/lib/finance/status";
import { getValueDisplayText } from "@/lib/finance/manual-payment.mjs";

function getFinanceBadgeClasses(financeState) {
  if (financeState === "Conciliado") return "bg-emerald-100 text-emerald-700";
  if (financeState === "Comprobante descartado - contactar usuario") return "bg-amber-100 text-amber-700";
  if (financeState === "Cubierta por pago ya usado") return "bg-sky-100 text-sky-700";
  if (financeState === "Pago en efectivo" || financeState === "Pago con tarjeta") return "bg-blue-100 text-blue-700";
  if (financeState === "Beca") return "bg-violet-100 text-violet-700";
  return "bg-amber-100 text-amber-700";
}

function getInitials(name) {
  if (!name || name === "Inscrito") return "?";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || "")
    .join("");
}

export default function AllSubmissionsManager({ initialSubmissions = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState(null);
  const [formFilter, setFormFilter] = useState("all");
  const [groupBy, setGroupBy] = useState("month");

  const { isLg } = useScreenSize();
  const itemsPerPage = isLg ? 12 : 6;

  const uniqueForms = useMemo(() => {
    const forms = initialSubmissions.map((s) => s.forms).filter(Boolean);
    const seen = new Set();
    return forms
      .filter((f) => {
        const duplicate = seen.has(f.id);
        seen.add(f.id);
        return !duplicate;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [initialSubmissions]);

  const processedSubmissions = useMemo(() => {
    let result = [...initialSubmissions];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((s) => {
        const formTitle = s.forms?.title?.toLowerCase() || "";
        const profileName = s.profiles?.full_name?.toLowerCase() || "";
        const subscriberName = findNameInSubmission(s).toLowerCase();
        const dataValues = [
          ...((s.answers || []).map((answer) => answer?.value)),
          ...Object.values(s.data || {}),
        ]
          .map((v) => getValueDisplayText(v).toLowerCase())
          .join(" ");

        return (
          formTitle.includes(searchLower) ||
          profileName.includes(searchLower) ||
          subscriberName.includes(searchLower) ||
          dataValues.includes(searchLower)
        );
      });
    }

    if (formFilter !== "all") {
      result = result.filter((s) => s.form_id === formFilter);
    }

    return result;
  }, [initialSubmissions, searchTerm, formFilter]);

  const selectedFormSubmissions = useMemo(() => {
    if (formFilter === "all") return [];
    return initialSubmissions.filter((s) => s.form_id === formFilter);
  }, [initialSubmissions, formFilter]);

  const selectedFormStats = useMemo(() => {
    if (formFilter === "all") return null;
    const totalConfirmedAmount = selectedFormSubmissions.reduce(
      (acc, sub) => acc + getRevenueContribution(sub),
      0,
    );
    return {
      totalRegistered: selectedFormSubmissions.length,
      totalConfirmedAmount,
    };
  }, [formFilter, selectedFormSubmissions]);

  const totalPages = Math.ceil(processedSubmissions.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedSubmissions.slice(startIndex, startIndex + itemsPerPage);
  }, [processedSubmissions, currentPage, itemsPerPage]);

  const groupedItems = useMemo(() => {
    const groups = {};
    currentItems.forEach((item) => {
      let groupKey = "Otros";
      if (groupBy === "month") {
        const date = parseISO(item.created_at);
        groupKey = format(date, "MMMM yyyy", { locale: es });
        groupKey = groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
      } else if (groupBy === "form") {
        groupKey = item.forms?.title || "Sin Formulario";
      }
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
    });
    return groups;
  }, [currentItems, groupBy]);

  const handleCopyLink = (token) => {
    const url = `${window.location.origin}/inscripcion/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(token);
    toast.success("Enlace copiado");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">

      {/* Stats cards */}
      {selectedFormStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-none shadow-md rounded-[2rem] bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--puembo-green)]/5 rounded-bl-[2rem]" />
            <CardContent className="p-6 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Inscritos
                </span>
                <div className="w-8 h-8 rounded-xl bg-[var(--puembo-green)]/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-[var(--puembo-green)]" />
                </div>
              </div>
              <p className="text-3xl md:text-4xl font-serif font-bold text-gray-900 tabular-nums">
                {selectedFormStats.totalRegistered}
              </p>
              <p className="text-xs text-gray-400 font-light">Total de personas inscritas</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md rounded-[2rem] bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--puembo-green)]/5 rounded-bl-[2rem]" />
            <CardContent className="p-6 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Monto confirmado
                </span>
                <div className="w-8 h-8 rounded-xl bg-[var(--puembo-green)]/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-[var(--puembo-green)]" />
                </div>
              </div>
              <p className="text-3xl md:text-4xl font-serif font-bold text-gray-900 tabular-nums">
                ${selectedFormStats.totalConfirmedAmount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 font-light">Pagos verificados acumulados</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter + results card */}
      <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-50 bg-gray-50/30">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--puembo-green)] transition-colors" />
              <Input
                placeholder="Buscar por evento, nombre, correo..."
                className="pl-14 h-16 rounded-full bg-white border-gray-200 focus:border-[var(--puembo-green)] transition-all text-base font-medium shadow-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            <div className="relative group w-full lg:w-72">
              <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--puembo-green)] transition-colors" />
              <select
                value={formFilter}
                onChange={(e) => {
                  setFormFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-14 pr-10 h-16 rounded-full bg-white border border-gray-200 focus:border-[var(--puembo-green)] transition-all text-sm font-bold appearance-none outline-none cursor-pointer text-gray-700 shadow-sm"
              >
                <option value="all">Todos los eventos</option>
                {uniqueForms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
            </div>

            <div className="bg-white p-1 rounded-full border border-gray-100 shadow-sm flex items-center shrink-0">
              <Button
                variant={groupBy === "month" ? "green" : "ghost"}
                size="sm"
                onClick={() => setGroupBy("month")}
                className="rounded-full h-8 px-4 text-[9px] font-black uppercase tracking-widest"
              >
                Mes
              </Button>
              <Button
                variant={groupBy === "form" ? "green" : "ghost"}
                size="sm"
                onClick={() => setGroupBy("form")}
                className="rounded-full h-8 px-4 text-[9px] font-black uppercase tracking-widest"
              >
                Evento
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {processedSubmissions.length === 0 ? (
            <div className="py-32 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
                <Ticket className="w-9 h-9 text-gray-200" />
              </div>
              <p className="text-gray-400 font-light italic text-lg font-serif px-8">
                {searchTerm || formFilter !== "all"
                  ? "No se encontraron resultados para tu búsqueda."
                  : "No hay inscripciones registradas en el portal."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {Object.entries(groupedItems).map(([groupName, items]) => (
                <div key={groupName} className="bg-white">
                  <div className="px-8 pt-8 pb-3 bg-gray-50/30">
                    <div className="flex items-center gap-4">
                      <div className="h-px w-8 bg-[var(--puembo-green)]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                        {groupName}
                      </span>
                      <div className="h-px grow bg-gray-100/60" />
                    </div>
                  </div>

                  <div className="hidden lg:block overflow-x-auto">
                    <Table>
                      <TableBody>
                        {items.map((sub) => (
                          <SubmissionRow
                            key={sub.id}
                            sub={sub}
                            isCopied={copiedId === sub.access_token}
                            onCopy={() => handleCopyLink(sub.access_token)}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="lg:hidden p-6 space-y-3">
                    {items.map((sub) => (
                      <SubmissionCard
                        key={sub.id}
                        sub={sub}
                        isCopied={copiedId === sub.access_token}
                        onCopy={() => handleCopyLink(sub.access_token)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="p-12 border-t border-gray-50 bg-gray-50/10">
              <PaginationControls
                hasNextPage={currentPage < totalPages}
                totalPages={totalPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SubmissionRow({ sub, onCopy, isCopied }) {
  const subscriberName = findNameInSubmission(sub);
  const initials = getInitials(subscriberName);
  const formattedDate = format(parseISO(sub.created_at), "d MMM yyyy", { locale: es });
  const formattedTime = format(parseISO(sub.created_at), "HH:mm");
  const amountPaid = getDisplayedSubmissionAmount(sub);
  const financeState = getFinanceDisplayState(sub);
  const isManual = ["cash", "card", "scholarship"].includes(sub.coverage_mode);

  return (
    <TableRow className="group transition-all duration-200 border-b border-gray-50 hover:bg-[var(--puembo-green)]/[0.025]">
      {/* Date */}
      <TableCell className="px-6 py-5 w-32">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-700 tabular-nums">{formattedDate}</span>
          <span className="text-[9px] font-black uppercase text-gray-300 tracking-widest mt-0.5">
            {formattedTime}
          </span>
        </div>
      </TableCell>

      {/* Event */}
      <TableCell className="px-4 py-5">
        <div className="flex flex-col gap-1 max-w-[260px]">
          <span className="font-bold text-gray-900 text-sm leading-tight truncate">
            {sub.forms?.title || "Formulario eliminado"}
          </span>
          {isManual && (
            <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-full bg-[var(--puembo-green)]/10 text-[var(--puembo-green)] text-[8px] font-black uppercase tracking-widest">
              Manual
            </span>
          )}
        </div>
      </TableCell>

      {/* Participant */}
      <TableCell className="px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--puembo-green)]/10 flex items-center justify-center shrink-0 border border-[var(--puembo-green)]/10">
            <span className="text-[10px] font-black text-[var(--puembo-green)]">{initials}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-tight">
              Participante
            </span>
            <span className="font-bold text-gray-900 text-sm leading-tight">
              {subscriberName}
            </span>
          </div>
        </div>
      </TableCell>

      {/* Amount + actions */}
      <TableCell className="px-4 pr-6 py-5 text-right">
        <div className="flex items-center justify-end gap-3">
          <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">
              Monto
            </span>
            <span className="text-base font-bold text-gray-900 tabular-nums">
              ${amountPaid.toFixed(2)}
            </span>
            <Badge
              className={cn(
                "rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border-none",
                getFinanceBadgeClasses(financeState),
              )}
            >
              {financeState}
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-full h-9 px-5 font-black text-[9px] uppercase tracking-widest gap-2 transition-all",
              isCopied
                ? "bg-emerald-50 text-emerald-600 scale-95"
                : "bg-gray-50 text-gray-500 hover:bg-gray-900 hover:text-white",
            )}
            onClick={onCopy}
          >
            {isCopied ? (
              <><Check className="w-3.5 h-3.5" /> Copiado</>
            ) : (
              <><Copy className="w-3.5 h-3.5" /> Link</>
            )}
          </Button>

          <Link href={`/inscripcion/${sub.access_token}`} target="_blank">
            <div className="h-9 w-9 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-[var(--puembo-green)] hover:text-white hover:border-transparent transition-all shadow-sm">
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </TableCell>
    </TableRow>
  );
}

function SubmissionCard({ sub, onCopy, isCopied }) {
  const subscriberName = findNameInSubmission(sub);
  const initials = getInitials(subscriberName);
  const date = format(parseISO(sub.created_at), "d MMM", { locale: es });
  const amountPaid = getDisplayedSubmissionAmount(sub);
  const financeState = getFinanceDisplayState(sub);
  const isManual = ["cash", "card", "scholarship"].includes(sub.coverage_mode);

  return (
    <div className="bg-white rounded-[1.75rem] p-5 border border-gray-100 shadow-sm space-y-4">
      {/* Header row */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[var(--puembo-green)]/10 flex items-center justify-center shrink-0 border border-[var(--puembo-green)]/10">
          <span className="text-[10px] font-black text-[var(--puembo-green)]">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-black text-[var(--puembo-green)] uppercase tracking-widest truncate">
              {sub.forms?.title}
            </span>
            {isManual && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-[var(--puembo-green)]/10 text-[var(--puembo-green)] text-[8px] font-black uppercase tracking-widest shrink-0">
                Manual
              </span>
            )}
          </div>
          <h4 className="text-sm font-bold text-gray-900 truncate leading-tight mt-0.5">
            {subscriberName}
          </h4>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-1.5 text-center shrink-0 border border-gray-100">
          <span className="text-[9px] font-black text-gray-400 block uppercase tracking-widest">
            {date}
          </span>
        </div>
      </div>

      {/* Amount + actions */}
      <div className="flex gap-2 items-stretch">
        <div className="flex-1 rounded-2xl border border-gray-100 bg-gray-50 p-3 space-y-1">
          <span className="block text-[9px] font-black uppercase tracking-widest text-gray-400">
            Monto
          </span>
          <p className="text-xl font-bold text-gray-900 tabular-nums">${amountPaid.toFixed(2)}</p>
          <Badge
            className={cn(
              "rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border-none",
              getFinanceBadgeClasses(financeState),
            )}
          >
            {financeState}
          </Badge>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className={cn(
              "flex-1 rounded-2xl px-4 text-[9px] font-black uppercase tracking-widest gap-2 h-auto",
              isCopied && "border-emerald-500 text-emerald-600 bg-emerald-50",
            )}
            onClick={onCopy}
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {isCopied ? "Copiado" : "Link"}
          </Button>
          <Button
            asChild
            variant="ghost"
            className="w-full rounded-2xl bg-gray-50 text-gray-400 h-auto py-3"
          >
            <Link href={`/inscripcion/${sub.access_token}`} target="_blank">
              <ExternalLink className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
