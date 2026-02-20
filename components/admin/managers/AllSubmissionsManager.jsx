"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useScreenSize } from "@/lib/hooks/useScreenSize";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Search,
  X,
  ExternalLink,
  Copy,
  Check,
  ClipboardList,
  Calendar,
  User,
  ArrowLeft,
  Filter,
  LayoutGrid,
  Rows,
  ChevronDown,
  Event,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { findNameInSubmission } from "@/lib/form-utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AllSubmissionsManager({ initialSubmissions = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState(null);
  const [formFilter, setFormFilter] = useState("all");
  const [groupBy, setGroupBy] = useState("none"); // "none", "month", "form"
  
  const { isLg, isSm } = useScreenSize();
  const itemsPerPage = isLg ? 12 : 6;

  // Extract unique forms for the filter
  const uniqueForms = useMemo(() => {
    const forms = initialSubmissions.map((s) => s.forms).filter(Boolean);
    const seen = new Set();
    return forms.filter((f) => {
      const duplicate = seen.has(f.id);
      seen.add(f.id);
      return !duplicate;
    }).sort((a, b) => a.title.localeCompare(b.title));
  }, [initialSubmissions]);

  const processedSubmissions = useMemo(() => {
    let result = [...initialSubmissions];
    
    // Search Filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((s) => {
        const formTitle = s.forms?.title?.toLowerCase() || "";
        const profileName = s.profiles?.full_name?.toLowerCase() || "";
        const subscriberName = findNameInSubmission(s.data).toLowerCase();
        
        // Search in JSON data values
        const dataValues = Object.values(s.data || {})
          .map(v => String(v).toLowerCase())
          .join(" ");
        
        return (
          formTitle.includes(searchLower) ||
          profileName.includes(searchLower) ||
          subscriberName.includes(searchLower) ||
          dataValues.includes(searchLower)
        );
      });
    }

    // Form Filter
    if (formFilter !== "all") {
      result = result.filter((s) => s.form_id === formFilter);
    }

    return result;
  }, [initialSubmissions, searchTerm, formFilter]);

  const totalPages = Math.ceil(processedSubmissions.length / itemsPerPage);
  
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedSubmissions.slice(startIndex, startIndex + itemsPerPage);
  }, [processedSubmissions, currentPage, itemsPerPage]);

  const groupedItems = useMemo(() => {
    if (groupBy === "none") return { "Resultados": currentItems };
    
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
    <div className="space-y-8 pb-20">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4">
        <div className="space-y-4">
          <Link
            href="/admin/formularios"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-[var(--puembo-green)] transition-all group"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Gestión de Formularios
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 tracking-tight leading-none">
              Control de{" "}
              <span className="text-[var(--puembo-green)] italic">
                Inscripciones
              </span>
            </h1>
            <p className="text-gray-400 font-light text-base max-w-xl">
              Busca y gestiona todos los registros del portal. Envía enlaces de seguimiento a los participantes.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
             <div className="bg-white p-1 rounded-full border border-gray-100 shadow-sm flex items-center">
                <Button 
                    variant={groupBy === "none" ? "green" : "ghost"} 
                    size="sm" 
                    onClick={() => setGroupBy("none")}
                    className="rounded-full h-8 px-4 text-[9px] font-black uppercase tracking-widest"
                >Lista</Button>
                <Button 
                    variant={groupBy === "month" ? "green" : "ghost"} 
                    size="sm" 
                    onClick={() => setGroupBy("month")}
                    className="rounded-full h-8 px-4 text-[9px] font-black uppercase tracking-widest"
                >Mes</Button>
                <Button 
                    variant={groupBy === "form" ? "green" : "ghost"} 
                    size="sm" 
                    onClick={() => setGroupBy("form")}
                    className="rounded-full h-8 px-4 text-[9px] font-black uppercase tracking-widest"
                >Evento</Button>
             </div>
        </div>
      </div>

      {/* Filtros Card */}
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
                className="w-full pl-14 pr-10 h-16 rounded-full bg-white border-gray-200 focus:border-[var(--puembo-green)] transition-all text-sm font-bold appearance-none outline-none cursor-pointer text-gray-700 shadow-sm"
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
          </div>
        </div>

        <CardContent className="p-0">
          {processedSubmissions.length === 0 ? (
            <div className="py-32 text-center space-y-4">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Ticket className="w-10 h-10 text-gray-200" />
              </div>
              <p className="text-gray-400 font-light italic text-xl font-serif px-8">
                {searchTerm || formFilter !== "all"
                  ? "No se encontraron resultados para tu búsqueda."
                  : "No hay inscripciones registradas en el portal."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {Object.entries(groupedItems).map(([groupName, items]) => (
                <div key={groupName} className="bg-white">
                  {groupBy !== "none" && (
                    <div className="px-8 pt-10 pb-4 bg-gray-50/30">
                        <div className="flex items-center gap-4">
                            <div className="h-px w-8 bg-[var(--puembo-green)]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">{groupName}</span>
                            <div className="h-px grow bg-gray-100/50" />
                        </div>
                    </div>
                  )}

                  <div className="hidden lg:block overflow-x-auto">
                    <Table>
                      <TableHeader className={cn("bg-gray-50/50", groupBy !== "none" && "sr-only")}>
                        <TableRow className="hover:bg-transparent border-b border-gray-100">
                          <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Fecha</TableHead>
                          <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Evento / Actividad</TableHead>
                          <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Nombre del Inscrito</TableHead>
                          <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
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

                  <div className="lg:hidden p-6 space-y-4">
                     {items.map(sub => (
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
  const subscriberName = findNameInSubmission(sub.data);
  const formattedDate = format(parseISO(sub.created_at), "d MMM, yyyy", { locale: es });
  const formattedTime = format(parseISO(sub.created_at), "HH:mm 'hrs'");

  return (
    <TableRow className="group transition-all duration-300 border-b border-gray-50 hover:bg-gray-50/50">
      <TableCell className="px-8 py-6">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-700">{formattedDate}</span>
          <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">{formattedTime}</span>
        </div>
      </TableCell>
      <TableCell className="px-8 py-6">
        <div className="flex flex-col max-w-[300px]">
          <span className="text-[9px] font-black text-[var(--puembo-green)] uppercase tracking-widest opacity-60 leading-tight mb-1">Evento</span>
          <span className="font-bold text-gray-900 text-sm leading-tight truncate">
            {sub.forms?.title || "Formulario Eliminado"}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner shrink-0">
             <User className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest opacity-60 leading-tight mb-1">Participante</span>
            <span className="font-bold text-gray-900 text-sm leading-tight">
              {subscriberName}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-8 py-6 text-right">
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-full h-10 px-6 font-black text-[9px] uppercase tracking-[0.2em] gap-2 transition-all",
              isCopied ? "bg-emerald-50 text-emerald-600 scale-95" : "bg-gray-50 text-gray-600 hover:bg-gray-900 hover:text-white"
            )}
            onClick={onCopy}
          >
            {isCopied ? (
              <><Check className="w-3.5 h-3.5" /> Copiado</>
            ) : (
              <><Copy className="w-3.5 h-3.5" /> Link de Pago</>
            )}
          </Button>
          <Link href={`/inscripcion/${sub.access_token}`} target="_blank">
            <div className="h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-[var(--puembo-green)] hover:text-white hover:border-transparent transition-all shadow-sm">
              <ExternalLink className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </TableCell>
    </TableRow>
  );
}

function SubmissionCard({ sub, onCopy, isCopied }) {
    const subscriberName = findNameInSubmission(sub.data);
    const date = format(parseISO(sub.created_at), "d MMM", { locale: es });
    
    return (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1 min-w-0">
                    <span className="text-[9px] font-black text-[var(--puembo-green)] uppercase tracking-widest">{sub.forms?.title}</span>
                    <h4 className="text-base font-bold text-gray-900 truncate">{subscriberName}</h4>
                </div>
                <div className="bg-gray-50 rounded-xl px-3 py-1 text-center shrink-0">
                    <span className="text-[9px] font-black text-gray-400 block uppercase">{date}</span>
                </div>
            </div>
            
            <div className="flex gap-2">
                <Button 
                    variant="outline" 
                    className={cn(
                        "flex-1 rounded-2xl h-12 text-[9px] font-black uppercase tracking-widest gap-2",
                        isCopied && "border-emerald-500 text-emerald-600 bg-emerald-50"
                    )}
                    onClick={onCopy}
                >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? "Copiado" : "Copiar Link"}
                </Button>
                <Link href={`/inscripcion/${sub.access_token}`} target="_blank" className="shrink-0">
                    <Button variant="ghost" className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400">
                        <ExternalLink className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
