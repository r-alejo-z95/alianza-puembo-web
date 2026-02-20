"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  FolderOpen,
  Plus,
  Loader2,
  FileSpreadsheet,
  Trash2,
  Search,
  SortAsc,
  SortDesc,
  LayoutGrid,
  Rows,
  X,
  CheckCircle2,
  User,
  ChevronDown,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import { FormRow } from "./table-cells/FormRow";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminFAB } from "../layout/AdminFAB";
import { ManagerSkeleton } from "../layout/AdminSkeletons";
import { useForms } from "@/lib/hooks/useForms";
import RecycleBin from "./RecycleBin";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function FormManager({ initialForms = [], isInternal = false }) {
  const {
    forms,
    archivedForms,
    loading,
    loadingArchived,
    archiveForm,
    archiveManyForms,
    restoreForm,
    restoreManyForms,
    permanentlyDeleteForm,
    permanentlyDeleteManyForms,
    emptyRecycleBin,
    fetchArchivedForms,
    refetchForms,
  } = useForms({ initialForms, isInternal });

  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });
  const [groupByMonth, setGroupByMonth] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_forms_groupByMonth");
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem(
      "admin_forms_groupByMonth",
      JSON.stringify(groupByMonth),
    );
  }, [groupByMonth]);

  const [selectedIds, setSelectedIds] = useState([]);
  const { isLg } = useScreenSize();
  const itemsPerPage = isLg ? 10 : 5;
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, authorFilter]);

  useEffect(() => {
    if (isRecycleBinOpen) fetchArchivedForms();
  }, [isRecycleBinOpen, fetchArchivedForms]);

  const uniqueAuthors = useMemo(() => {
    const authors = forms.map((f) => f.profiles).filter(Boolean);
    const seen = new Set();
    return authors.filter((author) => {
      const duplicate = seen.has(author.email);
      seen.add(author.email);
      return !duplicate;
    });
  }, [forms]);

  const handleEdit = (form) => {
    router.push(`/admin/formularios/builder?slug=${form.slug}`);
  };

  const handleDelete = async (formId) => {
    const success = await archiveForm(formId);
    if (success) setSelectedIds((prev) => prev.filter((id) => id !== formId));
  };

  const handleBulkArchive = async () => {
    const success = await archiveManyForms(selectedIds);
    if (success) setSelectedIds([]);
  };

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

  const processedForms = useMemo(() => {
    let result = [...forms];
    if (searchTerm)
      result = result.filter((f) =>
        f.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    if (authorFilter !== "all") {
      result = result.filter((f) => f.profiles?.email === authorFilter);
    }
    result.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      if (!valA) return 1;
      if (!valB) return -1;
      if (sortConfig.key === "title") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [forms, searchTerm, authorFilter, sortConfig]);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedForms.slice(startIndex, startIndex + itemsPerPage);
  }, [processedForms, currentPage, itemsPerPage]);

  const groupedCurrentItems = useMemo(() => {
    if (!groupByMonth) return { Resultados: currentItems };
    const groups = {};
    currentItems.forEach((formItem) => {
      const date = parseISO(formItem.created_at);
      const monthYear = format(date, "MMMM yyyy", { locale: es });
      const capitalizedMonth =
        monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
      if (!groups[capitalizedMonth]) groups[capitalizedMonth] = [];
      groups[capitalizedMonth].push(formItem);
    });
    return groups;
  }, [currentItems, groupByMonth]);

  const totalPages = Math.ceil(processedForms.length / itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.length === currentItems.length && currentItems.length > 0)
      setSelectedIds([]);
    else setSelectedIds(currentItems.map((f) => f.id));
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const createFormUrl = `/admin/formularios/builder${isInternal ? "?internal=true" : ""}`;

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-6 md:p-10 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-50/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <FolderOpen className="w-3 h-3" /> <span>Base de Datos</span>
            </div>
            <CardTitle className="text-3xl font-serif font-bold text-gray-900">
              {isInternal ? "Procesos Operativos" : "Gestión de Formularios"}
            </CardTitle>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/formularios/inscripciones">
              <Button
                variant="outline"
                className="rounded-full px-5 py-6 font-bold border-gray-200 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm"
              >
                <ClipboardList className="w-5 h-5 mr-2" />{" "}
                <span className="text-xs uppercase tracking-widest">
                  Inscripciones
                </span>
              </Button>
            </Link>
            <Button
              variant="outline"
              className="rounded-full px-5 py-6 font-bold border-gray-200 hover:bg-red-50 hover:text-red-600 transition-all"
              onClick={() => setIsRecycleBinOpen(true)}
            >
              <Trash2 className="w-5 h-5 mr-2" />{" "}
              <span className="text-xs uppercase tracking-widest">
                Papelera
              </span>
            </Button>
            <Button
              variant="green"
              className="hidden lg:flex rounded-full px-8 py-6 font-bold shadow-lg shadow-[var(--puembo-green)]/20 transition-all hover:-translate-y-0.5"
              onClick={() => router.push(createFormUrl)}
            >
              <Plus className="w-5 h-5 mr-2" /> Crear Formulario
            </Button>
          </div>
        </CardHeader>

        <div className="px-6 py-4 border-b border-gray-50 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:max-w-2xl">
              <div className="relative flex-1 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--puembo-green)] transition-colors" />
                <Input
                  placeholder="Buscar formulario..."
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
                  className="w-full pl-14 pr-10 h-14 rounded-full bg-gray-50 border-gray-100 focus:bg-white transition-all text-sm font-medium focus:ring-4 focus:ring-[var(--puembo-green)]/10 appearance-none outline-none cursor-pointer text-gray-700"
                >
                  <option value="all">Todos los autores</option>
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
                  variant={sortConfig.key === "title" ? "green" : "ghost"}
                  onClick={() => handleSort("title")}
                  className={cn(
                    "flex-1 lg:flex-none rounded-full h-10 px-6 font-bold text-[9px] uppercase tracking-[0.2em] gap-2 transition-all",
                    sortConfig.key === "title"
                      ? "shadow-md"
                      : "text-gray-400 hover:bg-gray-100",
                  )}
                >
                  {sortConfig.key === "title" &&
                    (sortConfig.direction === "asc" ? (
                      <SortAsc className="w-3.5 h-3.5" />
                    ) : (
                      <SortDesc className="w-3.5 h-3.5" />
                    ))}{" "}
                  Nombre
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
                  "w-full lg:w-auto rounded-full h-12 px-8 font-bold text-[9px] uppercase tracking-[0.2em] gap-3 transition-all shrink-0",
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
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Seleccionar Todo
                </span>
                <Checkbox
                  checked={
                    selectedIds.length === currentItems.length &&
                    currentItems.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  className="rounded-md border-gray-300 data-[state=checked]:bg-[var(--puembo-green)] data-[state=checked]:border-[var(--puembo-green)] scale-125"
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="mt-6 p-5 lg:p-4 bg-gray-900 rounded-[2.5rem] lg:rounded-full flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl ring-4 ring-black/5 z-30"
              >
                <div className="flex items-center gap-5 w-full lg:w-auto pl-2">
                  <div className="w-12 h-12 bg-[var(--puembo-green)] rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-base text-white">
                      {selectedIds.length} seleccionados
                    </span>
                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em]">
                      Gestión masiva
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:flex gap-3 w-full lg:w-auto">
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white hover:bg-white/5 rounded-full font-bold text-[10px] uppercase tracking-widest h-14 lg:h-12"
                    onClick={() => setSelectedIds([])}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full font-bold text-[10px] uppercase tracking-widest h-14 lg:h-12 gap-2 shadow-xl transition-all"
                    onClick={handleBulkArchive}
                  >
                    <Trash2 className="w-4 h-4" /> Archivar
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <CardContent className="p-0">
          {loading ? (
            <ManagerSkeleton rows={itemsPerPage} columns={6} />
          ) : processedForms.length === 0 ? (
            <div className="py-32 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <FileSpreadsheet className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-gray-400 font-light italic text-lg font-serif px-8">
                {searchTerm
                  ? "No se encontraron formularios."
                  : "No hay formularios creados."}
              </p>
            </div>
          ) : (
            <div id="forms-table">
              <div className="hidden lg:block overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="hover:bg-transparent border-b border-gray-100">
                      <TableHead className="px-8 py-6 w-[80px]">
                        <Checkbox
                          checked={
                            selectedIds.length === currentItems.length &&
                            currentItems.length > 0
                          }
                          onCheckedChange={toggleSelectAll}
                          className="rounded-md border-gray-300 data-[state=checked]:bg-[var(--puembo-green)] scale-110"
                        />
                      </TableHead>
                      <TableHead className="px-4 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                        Título
                      </TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">
                        Estado
                      </TableHead>
                      {!isInternal && (
                        <>
                          <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">
                            Sheets
                          </TableHead>
                          <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">
                            Drive
                          </TableHead>
                        </>
                      )}
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">
                        Autor
                      </TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(groupedCurrentItems).map(
                      ([group, groupForms]) => (
                        <React.Fragment key={group}>
                          {groupByMonth && (
                            <TableRow className="bg-white hover:bg-white border-none">
                              <TableCell
                                colSpan={isInternal ? 5 : 7}
                                className="px-8 pt-12 pb-4"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="h-px w-8 bg-[var(--puembo-green)]" />
                                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                                    {group}
                                  </span>
                                  <div className="h-px grow bg-gray-50" />
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                          {groupForms.map((form) => (
                            <FormRow
                              key={form.id}
                              form={form}
                              isSelected={selectedIds.includes(form.id)}
                              onSelect={() => toggleSelect(form.id)}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              compact={false}
                              isInternalView={isInternal}
                            />
                          ))}
                        </React.Fragment>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="lg:hidden p-6 space-y-12">
                {Object.entries(groupedCurrentItems).map(
                  ([group, groupForms]) => (
                    <div key={group} className="space-y-6">
                      {groupByMonth && (
                        <div className="flex items-center gap-4 px-2 pt-4">
                          <div className="h-px w-8 bg-[var(--puembo-green)]" />
                          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                            {group}
                          </span>
                        </div>
                      )}
                      {groupForms.map((form) => (
                        <FormRow
                          key={form.id}
                          form={form}
                          isSelected={selectedIds.includes(form.id)}
                          onSelect={() => toggleSelect(form.id)}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          compact={true}
                          isInternalView={isInternal}
                        />
                      ))}
                    </div>
                  ),
                )}
              </div>
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
            </div>
          )}
        </CardContent>
      </Card>
      <RecycleBin
        open={isRecycleBinOpen}
        onOpenChange={setIsRecycleBinOpen}
        type="forms"
        items={archivedForms}
        onRestore={restoreForm}
        onDelete={permanentlyDeleteForm}
        onBulkRestore={restoreManyForms}
        onBulkDelete={permanentlyDeleteManyForms}
        onEmptyTrash={emptyRecycleBin}
        loading={loadingArchived}
      />
      <AdminFAB
        onClick={() => router.push(createFormUrl)}
        label="Crear Formulario"
      />
    </div>
  );
}
