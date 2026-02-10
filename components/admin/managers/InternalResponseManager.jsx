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
  Trash2,
  ChevronRight,
  User,
  Calendar,
  Loader2,
  Clock,
  ShieldCheck,
  ChevronDown,
  ClipboardList,
  SortAsc,
  SortDesc,
  LayoutGrid,
  Rows,
  CheckCircle2,
  Plus,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ManagerSkeleton } from "../layout/AdminSkeletons";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { useFormSubmissions } from "@/lib/hooks/useFormSubmissions";
import { AdminEditorPanel } from "../layout/AdminEditorPanel";
import RecycleBin from "./RecycleBin";
import { useRouter } from "next/navigation";

export default function InternalResponseManager({ form, initialSubmissions = [] }) {
  const {
    submissions,
    archivedSubmissions,
    loading,
    loadingArchived,
    archiveSubmission,
    archiveManySubmissions,
    restoreSubmission,
    restoreManySubmissions,
    permanentlyDeleteSubmission,
    permanentlyDeleteManySubmissions,
    emptyRecycleBin,
    fetchArchivedSubmissions,
  } = useFormSubmissions({ formId: form.id, initialSubmissions });

  const router = useRouter();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });

  const [groupByMonth, setGroupByMonth] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`admin_internal_responses_groupByMonth_${form.id}`);
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem(`admin_internal_responses_groupByMonth_${form.id}`, JSON.stringify(groupByMonth));
  }, [groupByMonth, form.id]);

  const { isLg } = useScreenSize();
  const itemsPerPage = isLg ? 10 : 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, authorFilter]);

  useEffect(() => {
    if (isRecycleBinOpen) fetchArchivedSubmissions();
  }, [isRecycleBinOpen, fetchArchivedSubmissions]);

  const uniqueAuthors = useMemo(() => {
    const authors = submissions.map((s) => s.profiles).filter(Boolean);
    const seen = new Set();
    return authors.filter((author) => {
      const duplicate = seen.has(author.email);
      seen.add(author.email);
      return !duplicate;
    });
  }, [submissions]);

  const handleSort = (key) => {
    if (sortConfig.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ key, direction: "asc" });
    }
  };

  const processedSubmissions = useMemo(() => {
    let result = [...submissions];
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((s) => {
        const userMatch = s.profiles?.full_name?.toLowerCase().includes(searchLower) || 
                         s.profiles?.email?.toLowerCase().includes(searchLower);
        const contentMatch = JSON.stringify(s.answers || s.data).toLowerCase().includes(searchLower);
        return userMatch || contentMatch;
      });
    }
    if (authorFilter !== "all") {
      result = result.filter((s) => s.profiles?.email === authorFilter);
    }
    result.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      if (sortConfig.key === "profiles") {
        valA = a.profiles?.full_name || "";
        valB = b.profiles?.full_name || "";
      }
      if (!valA) return 1;
      if (!valB) return -1;
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [submissions, searchTerm, authorFilter, sortConfig]);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedSubmissions.slice(startIndex, startIndex + itemsPerPage);
  }, [processedSubmissions, currentPage, itemsPerPage]);

  const groupedItems = useMemo(() => {
    if (!groupByMonth) return { "Resultados": currentItems };
    const groups = {};
    currentItems.forEach((item) => {
      const date = parseISO(item.created_at);
      const monthYear = format(date, "MMMM yyyy", { locale: es });
      const capitalized = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
      if (!groups[capitalized]) groups[capitalized] = [];
      groups[capitalized].push(item);
    });
    return groups;
  }, [currentItems, groupByMonth]);

  const totalPages = Math.ceil(processedSubmissions.length / itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.length === currentItems.length && currentItems.length > 0)
      setSelectedIds([]);
    else setSelectedIds(currentItems.map((s) => s.id));
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkArchive = async () => {
    const success = await archiveManySubmissions(selectedIds);
    if (success) setSelectedIds([]);
  };

  const handleOpenSubmission = (sub) => {
    setSelectedSubmission(sub);
    setIsPanelOpen(true);
  };

  const sortedFields = useMemo(() => {
    return (form.form_fields || [])
      .filter(f => (f.type || f.field_type) !== 'section')
      .sort((a, b) => (a.order_index ?? a.order ?? 0) - (b.order_index ?? b.order ?? 0));
  }, [form]);

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-6 md:p-10 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-50/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <ClipboardList className="w-3 h-3" /> <span>Bitácora de {form.title}</span>
            </div>
            <CardTitle className="text-3xl font-serif font-bold text-gray-900 leading-tight">
              Gestión de Respuestas
            </CardTitle>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-full px-5 py-6 font-bold border-gray-200 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
              onClick={() => setIsRecycleBinOpen(true)}
            >
              <Trash2 className="w-5 h-5 mr-2" />
              <span className="text-xs uppercase tracking-widest">Papelera</span>
            </Button>
          </div>
        </CardHeader>

        <div className="px-6 py-4 border-b border-gray-50 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:max-w-2xl">
              <div className="relative flex-1 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--puembo-green)] transition-colors" />
                <Input
                  placeholder="Buscar en el contenido..."
                  className="pl-14 h-14 rounded-full bg-gray-50 border-gray-100 focus:bg-white transition-all text-sm font-medium focus:ring-4 focus:ring-[var(--puembo-green)]/10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </div>

              <div className="relative group min-w-[200px]">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--puembo-green)] transition-colors" />
                <select
                  value={authorFilter}
                  onChange={(e) => setAuthorFilter(e.target.value)}
                  className="w-full pl-14 pr-10 h-14 rounded-full bg-gray-50 border-gray-100 focus:bg-white transition-all text-sm font-medium focus:ring-4 focus:ring-[var(--puembo-green)]/10 appearance-none outline-none cursor-pointer text-gray-700 shadow-sm"
                >
                  <option value="all">Todos los miembros</option>
                  {uniqueAuthors.map((author) => (
                    <option key={author.email} value={author.email}>
                      {author.full_name?.split(" ")[0] || author.email}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center bg-gray-50 p-1 rounded-full border border-gray-100 w-full lg:w-auto">
                <Button
                  variant={sortConfig.key === "profiles" ? "green" : "ghost"}
                  onClick={() => handleSort("profiles")}
                  className={cn(
                    "flex-1 lg:flex-none rounded-full h-10 px-6 font-bold text-[9px] uppercase tracking-[0.2em] gap-2 transition-all",
                    sortConfig.key === "profiles"
                      ? "shadow-md"
                      : "text-gray-400 hover:bg-gray-100",
                  )}
                >
                  {sortConfig.key === "profiles" &&
                    (sortConfig.direction === "asc" ? (
                      <SortAsc className="w-3.5 h-3.5" />
                    ) : (
                      <SortDesc className="w-3.5 h-3.5" />
                    ))}{" "}
                  Autor
                </Button>
                <Button
                  variant={sortConfig.key === "created_at" ? "green" : "ghost"}
                  onClick={() => handleSort("created_at")}
                  className={cn(
                    "flex-1 lg:flex-none rounded-full h-10 px-6 font-bold text-[9px] uppercase tracking-[0.2em] gap-2 transition-all",
                    sortConfig.key === "created_at"
                      ? "shadow-md"
                      : "text-gray-400 hover:bg-gray-100",
                  )}
                >
                  {sortConfig.key === "created_at" &&
                    (sortConfig.direction === "asc" ? (
                      <SortAsc className="w-3.5 h-3.5" />
                    ) : (
                      <SortDesc className="w-3.5 h-3.5" />
                    ))}{" "}
                  Fecha
                </Button>
              </div>

              <Button
                variant={groupByMonth ? "green" : "outline"}
                className={cn(
                  "w-full lg:w-auto rounded-full h-12 px-8 font-bold text-[9px] uppercase tracking-[0.2em] gap-3 transition-all",
                  !groupByMonth &&
                    "border-gray-100 text-gray-500 hover:bg-gray-50",
                )}
                onClick={() => setGroupByMonth(!groupByMonth)}
              >
                {groupByMonth ? (
                  <LayoutGrid className="w-3.5 h-3.5" />
                ) : (
                  <Rows className="w-3.5 h-3.5" />
                )}{" "}
                {groupByMonth ? "Agrupado" : "Lista"}
              </Button>

              <div className="lg:hidden flex items-center justify-between bg-gray-50/50 px-6 rounded-full border border-gray-100 h-14 w-full">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Seleccionar Todo</span>
                <Checkbox
                  checked={selectedIds.length === currentItems.length && currentItems.length > 0}
                  onCheckedChange={toggleSelectAll}
                  className="rounded-md border-gray-300 data-[state=checked]:bg-[var(--puembo-green)] scale-125"
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="mt-6 p-5 lg:p-4 bg-gray-900 rounded-[2.5rem] lg:rounded-full flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl ring-4 ring-black/5 z-30">
                <div className="flex items-center gap-5 w-full lg:w-auto pl-2">
                  <div className="w-12 h-12 bg-[var(--puembo-green)] rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/20"><CheckCircle2 className="w-6 h-6" /></div>
                  <div className="flex flex-col text-left text-white">
                    <span className="font-bold text-base">{selectedIds.length} seleccionados</span>
                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em]">Gestión masiva</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:flex gap-3 w-full lg:w-auto">
                  <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5 rounded-full font-bold text-[10px] uppercase tracking-widest h-14 lg:h-12" onClick={() => setSelectedIds([])}>Cancelar</Button>
                  <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full font-bold text-[10px] uppercase tracking-widest h-14 lg:h-12 gap-2 shadow-xl transition-all" onClick={handleBulkArchive}><Trash2 className="w-4 h-4" /> Archivar</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <CardContent className="p-0">
          {loading ? (
            <ManagerSkeleton rows={itemsPerPage} columns={4} />
          ) : submissions.length === 0 ? (
            <div className="py-32 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <ClipboardList className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-gray-400 font-light italic text-lg font-serif px-8">
                {searchTerm
                  ? "No se encontraron registros."
                  : "No hay registros activos en esta bitácora."}
              </p>
            </div>
          ) : (
            <div id="responses-table">
              <div className="hidden lg:block overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="hover:bg-transparent border-b border-gray-100">
                      <TableHead className="px-8 py-6 w-[80px]">
                        <Checkbox 
                          checked={selectedIds.length === currentItems.length && currentItems.length > 0} 
                          onCheckedChange={toggleSelectAll} 
                          className="rounded-md border-gray-300 data-[state=checked]:bg-[var(--puembo-green)] scale-110"
                        />
                      </TableHead>
                      <TableHead className="px-4 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Responsable Staff</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">Fecha de Registro</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(groupedItems).map(([groupName, groupSubmissions]) => (
                      <React.Fragment key={groupName}>
                        {groupByMonth && (
                          <TableRow className="bg-white hover:bg-white border-none">
                            <TableCell colSpan={4} className="px-8 pt-12 pb-4">
                              <div className="flex items-center gap-4">
                                <div className="h-px w-8 bg-[var(--puembo-green)]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">{groupName}</span>
                                <div className="h-px grow bg-gray-50" />
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                        {groupSubmissions.map((sub) => (
                          <SubmissionRow 
                            key={sub.id} 
                            sub={sub} 
                            isSelected={selectedIds.includes(sub.id)}
                            onSelect={() => toggleSelect(sub.id)}
                            onOpen={() => handleOpenSubmission(sub)}
                            onArchive={() => archiveSubmission(sub.id)}
                          />
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="lg:hidden p-6 space-y-12">
                {Object.entries(groupedItems).map(([groupName, groupSubmissions]) => (
                  <div key={groupName} className="space-y-6">
                    {groupByMonth && (
                      <div className="flex items-center gap-4 px-2 pt-4">
                        <div className="h-px w-8 bg-[var(--puembo-green)]" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">{groupName}</span>
                      </div>
                    )}
                    {groupSubmissions.map(sub => (
                      <SubmissionRow 
                        key={sub.id} 
                        sub={sub} 
                        isCompact={true} 
                        isSelected={selectedIds.includes(sub.id)}
                        onSelect={() => toggleSelect(sub.id)}
                        onOpen={() => handleOpenSubmission(sub)}
                        onArchive={() => archiveSubmission(sub.id)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="p-12 border-t border-gray-50 bg-gray-50/10">
              <PaginationControls hasNextPage={currentPage < totalPages} totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            </div>
          )}
        </CardContent>
      </Card>

      <AdminEditorPanel
        open={isPanelOpen}
        onOpenChange={setIsPanelOpen}
        title={
          <>
            Detalle de <br />
            <span className="text-[var(--puembo-green)] italic">Registro</span>
          </>
        }
      >
        <div className="md:p-12 bg-white pb-20 space-y-12">
          {selectedSubmission && (
            <>
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
                  <div className="h-px w-8 bg-gray-200" />
                  <span>Ficha del Proceso</span>
                </div>
                <div className="bg-gray-50 rounded-[2rem] p-8 md:p-10 border border-gray-100 relative overflow-hidden">
                  <ClipboardList className="absolute -right-4 -bottom-4 w-32 h-32 text-gray-100 -rotate-12" />
                  <div className="relative z-10 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/50 pb-6">
                      <div className="flex items-center gap-4">
                        <AuthorAvatar profile={selectedSubmission.profiles} className="h-12 w-12" />
                        <div>
                          <p className="font-bold text-gray-900 text-lg leading-tight">{selectedSubmission.profiles?.full_name || "Miembro del Staff"}</p>
                          <p className="text-xs text-[var(--puembo-green)] font-medium">{selectedSubmission.profiles?.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col md:items-end text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {format(parseISO(selectedSubmission.created_at), "d MMMM, yyyy", { locale: es })}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {format(parseISO(selectedSubmission.created_at), "HH:mm 'hrs'")}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                      {sortedFields.map(f => {
                        const val = (selectedSubmission.answers || selectedSubmission.data || {})[f.label];
                        if (val === undefined) return null;
                        
                        const type = f.type || f.field_type;
                        const isLongText = type === 'textarea';
                        const isMedia = type === 'image' || type === 'file';
                        
                        return (
                          <div key={f.id} className={cn("space-y-2", isLongText || isMedia ? "md:col-span-2" : "")}>
                            <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">{f.label}</p>
                            <div className={cn(
                              "text-sm font-medium text-gray-700 bg-white/50 p-4 rounded-2xl border border-gray-100/50 leading-relaxed",
                              isLongText && "whitespace-pre-wrap"
                            )}>
                              {(() => {
                                if (type === 'image' && typeof val === 'string' && val.includes('http')) {
                                  return (
                                    <div className="group/img relative w-fit">
                                      <img src={val} alt={f.label} className="max-h-64 rounded-xl border shadow-sm" />
                                      <a href={val} target="_blank" rel="noreferrer" className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-all hover:scale-110">
                                        <ArrowRight className="w-4 h-4" />
                                      </a>
                                    </div>
                                  );
                                }
                                if (type === 'file' && typeof val === 'string' && val.includes('http')) {
                                  return (
                                    <a href={val} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-blue-600 hover:text-blue-700 font-bold decoration-2 underline-offset-4 hover:underline">
                                      <div className="p-2 bg-blue-50 rounded-lg"><ClipboardList className="w-5 h-5" /></div>
                                      Ver Documento Adjunto
                                    </a>
                                  );
                                }
                                if (Array.isArray(val)) {
                                  return (
                                    <div className="flex flex-wrap gap-2">
                                      {val.map((v, i) => (
                                        <Badge key={i} variant="outline" className="bg-white border-gray-200 text-gray-600 font-bold text-[10px] uppercase px-3 py-1">
                                          {v}
                                        </Badge>
                                      ))}
                                    </div>
                                  );
                                }
                                return String(val || "—");
                              })()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="pt-6 border-t border-gray-200/50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-300 uppercase tracking-tighter opacity-50">
                        <ShieldCheck className="w-4 h-4" /> ID: {selectedSubmission.id}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 text-[10px] font-bold uppercase tracking-widest gap-2" 
                        onClick={() => {
                          archiveSubmission(selectedSubmission.id);
                          setIsPanelOpen(false);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Archivar este registro
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-8">
                 <Button
                    variant="green"
                    className="rounded-full px-12 py-8 font-bold uppercase tracking-[0.2em] text-xs shadow-xl shadow-green-500/20 gap-3"
                    onClick={() => setIsPanelOpen(false)}
                  >
                    Cerrar Detalle
                  </Button>
              </div>
            </>
          )}
        </div>
      </AdminEditorPanel>

      <RecycleBin
        open={isRecycleBinOpen}
        onOpenChange={setIsRecycleBinOpen}
        type="submissions"
        items={archivedSubmissions}
        onRestore={restoreSubmission}
        onDelete={permanentlyDeleteSubmission}
        onBulkRestore={restoreManySubmissions}
        onBulkDelete={permanentlyDeleteManySubmissions}
        onEmptyTrash={emptyRecycleBin}
        loading={loadingArchived}
      />
    </div>
  );
}

function SubmissionRow({ sub, isSelected, onSelect, onOpen, onArchive, isCompact = false }) {
  if (isCompact) {
    return (
      <div 
        className={cn(
          "bg-white rounded-[1.5rem] p-5 shadow-sm border transition-all duration-200 space-y-4 relative overflow-hidden",
          isSelected ? "border-green-200 bg-green-50/30" : "border-gray-100",
        )}
        onClick={onOpen}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Checkbox 
              checked={isSelected}
              onCheckedChange={(e) => {
                onSelect();
              }}
              onClick={(e) => e.stopPropagation()}
              className="mt-1 rounded-md border-gray-300 data-[state=checked]:bg-[var(--puembo-green)] data-[state=checked]:border-[var(--puembo-green)]"
            />
            <div className="space-y-1 min-w-0 flex-1">
              <span className="text-[9px] font-black text-[var(--puembo-green)] uppercase tracking-widest">Responsable Staff</span>
              <h4 className="text-lg font-serif font-bold text-gray-900 truncate">
                 {sub.profiles?.full_name || sub.profiles?.email || "Sin nombre"}
              </h4>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
             <span className="text-[9px] text-gray-300 font-bold">{format(parseISO(sub.created_at), "HH:mm")}</span>
             <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-full text-[8px] font-black uppercase">Staff</Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TableRow
      className={cn(
        "group transition-all duration-300 border-b border-gray-50 cursor-pointer",
        isSelected ? "bg-green-50/40" : "hover:bg-gray-50/50",
      )}
      onClick={onOpen}
    >
      <TableCell className="px-8 py-6 w-12">
        <Checkbox 
          checked={isSelected}
          onCheckedChange={(e) => {
            onSelect();
          }}
          onClick={(e) => e.stopPropagation()}
          className="rounded-md border-gray-300 data-[state=checked]:bg-[var(--puembo-green)] data-[state=checked]:border-[var(--puembo-green)] scale-110"
        />
      </TableCell>
      <TableCell className="px-4 py-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-[var(--puembo-green)] uppercase tracking-widest opacity-60 leading-tight mb-1">Responsable</span>
          <span className="font-bold text-gray-900 text-lg group-hover:text-[var(--puembo-green)] transition-colors leading-tight">
            {sub.profiles?.full_name || sub.profiles?.email}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-8 py-6 text-center">
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-gray-700">{format(parseISO(sub.created_at), "d MMM, yyyy", { locale: es })}</span>
          <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">{format(parseISO(sub.created_at), "HH:mm 'hrs'")}</span>
        </div>
      </TableCell>
      <TableCell className="px-8 py-6 text-right">
         <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all" onClick={(e) => { e.stopPropagation(); onArchive(); }}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[var(--puembo-green)] group-hover:text-white transition-all shadow-sm">
               <ChevronRight className="w-5 h-5" />
            </div>
         </div>
      </TableCell>
    </TableRow>
  );
}

function AuthorAvatar({ profile, className }) {
  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : profile?.email?.charAt(0).toUpperCase() || "A";

  return (
    <div
      className={cn(
        "h-10 w-10 rounded-full bg-black flex items-center justify-center text-white text-[10px] font-black border-2 border-white shadow-md shrink-0",
        className,
      )}
    >
      {initials}
    </div>
  );
}
