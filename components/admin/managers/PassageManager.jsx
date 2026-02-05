"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import PassageForm from "@/components/admin/forms/PassageForm";
import {
  Edit,
  Trash2,
  Plus,
  Calendar,
  BookOpen,
  Search,
  X,
  CheckCircle2,
  SortAsc,
  SortDesc,
  User,
  ChevronDown,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { AuthorAvatar } from "@/components/shared/AuthorAvatar";
import { AdminEditorPanel } from "../layout/AdminEditorPanel";
import { AdminFAB } from "../layout/AdminFAB";
import { ManagerSkeleton } from "../layout/AdminSkeletons";
import { useLom } from "@/lib/hooks/useLom";
import RecycleBin from "./RecycleBin";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import { motion, AnimatePresence } from "framer-motion";

const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export default function PassageManager() {
  const {
    items: passages,
    archivedItems: archivedPassages,
    loading,
    loadingArchived,
    archiveItem,
    archiveManyItems,
    restoreItem,
    restoreManyItems,
    permanentlyDeleteItem,
    permanentlyDeleteManyItems,
    emptyRecycleBin,
    fetchArchivedItems,
    refetchItems,
  } = useLom({ type: "passages" });

  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedIds, setSelectedIds] = useState([]);

  const itemsPerPage = 5;
  const supabase = createClient();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, authorFilter]);

  useEffect(() => {
    if (isRecycleBinOpen) fetchArchivedItems();
  }, [isRecycleBinOpen, fetchArchivedItems]);

  const uniqueAuthors = useMemo(() => {
    const authors = passages.map((p) => p.profiles).filter(Boolean);
    const seen = new Set();
    return authors.filter((author) => {
      const duplicate = seen.has(author.email);
      seen.add(author.email);
      return !duplicate;
    });
  }, [passages]);

  const allWeeks = useMemo(() => {
    if (!passages) return [];
    let filtered = passages;
    if (searchTerm) {
      filtered = passages.filter(
        (p) =>
          p.passage_reference
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          p.week_number.toString().includes(searchTerm),
      );
    }
    if (authorFilter !== "all") {
      filtered = filtered.filter((p) => p.profiles?.email === authorFilter);
    }
    const sortedData = [...filtered].sort(
      (a, b) =>
        daysOfWeek.indexOf(a.day_of_week) - daysOfWeek.indexOf(b.day_of_week),
    );
    const grouped = sortedData.reduce((acc, passage) => {
      const week = acc.find((w) => w.week_number === passage.week_number);
      if (week) {
        week.passages.push(passage);
      } else {
        acc.push({
          week_number: passage.week_number,
          passages: [passage],
          profiles: passage.profiles,
          id: `week-${passage.week_number}`,
        });
      }
      return acc;
    }, []);
    return grouped.sort((a, b) =>
      sortDirection === "desc"
        ? b.week_number - a.week_number
        : a.week_number - b.week_number,
    );
  }, [passages, searchTerm, authorFilter, sortDirection]);

  const currentWeeks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return allWeeks.slice(startIndex, startIndex + itemsPerPage);
  }, [allWeeks, currentPage, itemsPerPage]);

  const handleSave = async (data) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const passagesToSave = data.passages
      .filter((p) => p.passage_reference)
      .map((p) => ({
        ...p,
        week_number: data.week_number,
        week_start_date: data.week_start_date,
        user_id: user?.id,
        is_archived: false,
      }));
    if (selectedWeek) {
      await supabase
        .from("lom_passages")
        .delete()
        .eq("week_number", selectedWeek.week_number);
    }
    if (passagesToSave.length > 0) {
      const { error } = await supabase
        .from("lom_passages")
        .insert(passagesToSave);
      if (error) toast.error("Error al guardar.");
      else toast.success("Semana programada.");
    }
    setIsFormOpen(false);
    refetchItems();
  };

  const handleDeleteWeek = async (week_number) => {
    const ids = passages
      .filter((p) => p.week_number === week_number)
      .map((p) => p.id);
    await archiveManyItems(ids);
  };

  const handleBulkArchive = async () => {
    const passageIds = passages
      .filter((p) => selectedIds.includes(`week-${p.week_number}`))
      .map((p) => p.id);
    const success = await archiveManyItems(passageIds);
    if (success) setSelectedIds([]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === currentWeeks.length && currentWeeks.length > 0)
      setSelectedIds([]);
    else setSelectedIds(currentWeeks.map((w) => w.id));
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-6 md:p-10 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-50/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <Calendar className="w-3 h-3" /> <span>Ciclo de Lectura</span>
            </div>
            <CardTitle className="text-3xl font-serif font-bold text-gray-900">
              Pasajes Semanales
            </CardTitle>
          </div>
          <div className="flex gap-3">
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
              onClick={() => {
                setSelectedWeek(null);
                setIsFormOpen(true);
              }}
            >
              <Plus className="w-5 h-5 mr-2" /> Programar Semana
            </Button>
          </div>
        </CardHeader>

        <div className="px-6 py-4 border-b border-gray-50 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:max-w-2xl">
              <div className="relative flex-1 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--puembo-green)] transition-colors" />
                <Input
                  placeholder="Buscar pasaje..."
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
              <div className="flex items-center bg-gray-50 p-1 rounded-full border border-gray-100 shrink-0 w-full lg:w-auto">
                <Button
                  variant="green"
                  onClick={() =>
                    setSortDirection((prev) =>
                      prev === "asc" ? "desc" : "asc",
                    )
                  }
                  className="flex-1 lg:flex-none rounded-full h-10 px-6 font-bold text-[9px] uppercase tracking-[0.2em] gap-2 shadow-md"
                >
                  {sortDirection === "asc" ? (
                    <SortAsc className="w-3.5 h-3.5" />
                  ) : (
                    <SortDesc className="w-3.5 h-3.5" />
                  )}{" "}
                  Semana
                </Button>
              </div>
              <div className="lg:hidden flex items-center justify-between bg-gray-50/50 px-6 rounded-full border border-gray-100 h-14 w-full">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Seleccionar Todo
                </span>
                <Checkbox
                  checked={
                    selectedIds.length === currentWeeks.length &&
                    currentWeeks.length > 0
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
                <div className="flex items-center gap-5 w-full lg:w-auto pl-2 text-white">
                  <div className="w-12 h-12 bg-[var(--puembo-green)] rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-base text-white">
                      {selectedIds.length} seleccionadas
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

        <CardContent className="p-4 md:p-12">
          {loading ? (
            <ManagerSkeleton rows={itemsPerPage} columns={1} />
          ) : allWeeks.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <BookOpen className="w-12 h-12 text-gray-100 mx-auto" />
              <p className="text-gray-400 font-light italic text-lg font-serif">
                No se encontraron pasajes.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {currentWeeks.map((week) => (
                  <div key={week.id} className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedIds.includes(week.id)}
                      onCheckedChange={() => toggleSelect(week.id)}
                      className="mt-8 rounded-md border-gray-300 data-[state=checked]:bg-[var(--puembo-green)] scale-110"
                    />
                    <AccordionItem
                      value={week.id}
                      className={cn(
                        "flex-1 border rounded-[2.5rem] px-6 lg:px-10 transition-all duration-300",
                        selectedIds.includes(week.id)
                          ? "border-green-200 bg-green-50/20 shadow-inner"
                          : "border-gray-100 bg-white hover:border-[var(--puembo-green)]/20",
                      )}
                    >
                      <AccordionTrigger className="hover:no-underline py-8">
                        <div className="flex items-center gap-4 lg:gap-8 text-left">
                          <div
                            className={cn(
                              "w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                              selectedIds.includes(week.id)
                                ? "bg-[var(--puembo-green)] text-white shadow-lg"
                                : "bg-gray-50 text-gray-400",
                            )}
                          >
                            <Calendar className="w-5 h-5 lg:w-7 lg:h-7" />
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-lg md:text-2xl font-serif font-bold text-gray-900 leading-none">
                              Semana {week.week_number}
                            </p>
                            <div className="flex items-center gap-3">
                              <AuthorAvatar
                                profile={week.profiles}
                                className="h-6 w-6 border-white shadow-sm"
                              />
                              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic">
                                Programado por{" "}
                                {week.profiles?.full_name?.split(" ")[0] ||
                                  "Admin"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-10 pt-2">
                        <div className="bg-gray-50/50 rounded-[2rem] p-8 lg:p-10 flex flex-col md:flex-row justify-between items-end gap-10 border border-gray-100/50">
                          <div className="w-full">
                            <div className="flex items-center gap-4 mb-8">
                              <div className="h-px w-8 bg-[var(--puembo-green)]" />
                              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                                Lecturas Diarias
                              </span>
                            </div>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                              {week.passages.map((passage) => (
                                <li
                                  key={passage.id}
                                  className="flex flex-col gap-1.5 group"
                                >
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                    {passage.day_of_week}
                                  </span>
                                  <span className="text-lg font-serif font-bold text-gray-800 group-hover:text-[var(--puembo-green)] transition-colors">
                                    {passage.passage_reference}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex gap-3 shrink-0 w-full md:w-auto">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedWeek(week);
                                setIsFormOpen(true);
                              }}
                              className="rounded-full h-12 px-8 flex-1 md:flex-none border-gray-200 font-bold text-[10px] uppercase tracking-widest hover:bg-[var(--puembo-green)] hover:text-white transition-all"
                            >
                              <Edit className="w-4 h-4 mr-2" /> Editar
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="rounded-full h-12 w-12 p-0 text-red-500 hover:bg-red-50 transition-all"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10 text-center">
                                <AlertDialogHeader className="space-y-4">
                                  <AlertDialogTitle className="text-3xl font-serif font-bold text-gray-900 text-center">
                                    ¿Mover a la papelera?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-500 text-base leading-relaxed text-center">
                                    Todos los pasajes de la{" "}
                                    <span className="font-bold text-gray-900">
                                      semana {week.week_number}
                                    </span>{" "}
                                    se archivarán.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="pt-8 grid grid-cols-1 gap-3">
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteWeek(week.week_number)
                                    }
                                    className="rounded-full h-14 bg-red-500 hover:bg-red-600 font-bold text-xs uppercase tracking-widest shadow-xl"
                                  >
                                    Confirmar
                                  </AlertDialogAction>
                                  <AlertDialogCancel className="rounded-full h-14 border-none text-gray-400 font-bold text-xs uppercase tracking-widest">
                                    Cancelar
                                  </AlertDialogCancel>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </div>
                ))}
              </Accordion>
              {allWeeks.length > itemsPerPage && (
                <div className="pt-12 border-t border-gray-50">
                  <PaginationControls
                    hasNextPage={
                      currentPage < Math.ceil(allWeeks.length / itemsPerPage)
                    }
                    totalPages={Math.ceil(allWeeks.length / itemsPerPage)}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AdminEditorPanel
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={
          <>
            Lecturas de <br />
            <span className="text-[var(--puembo-green)] italic">la Semana</span>
          </>
        }
      >
        <div className="md:p-12 bg-white pb-12">
          <PassageForm
            week={selectedWeek}
            onSave={handleSave}
            onCancel={() => setIsFormOpen(false)}
            loading={loading}
          />
        </div>
      </AdminEditorPanel>

      <RecycleBin
        open={isRecycleBinOpen}
        onOpenChange={setIsRecycleBinOpen}
        type="lom-passages"
        items={archivedPassages}
        onRestore={restoreItem}
        onDelete={permanentlyDeleteItem}
        onBulkRestore={restoreManyItems}
        onBulkDelete={permanentlyDeleteManyItems}
        onEmptyTrash={emptyRecycleBin}
        loading={loadingArchived}
      />
      <AdminFAB
        onClick={() => {
          setSelectedWeek(null);
          setIsFormOpen(true);
        }}
        label="Programar Semana"
      />
    </div>
  );
}
