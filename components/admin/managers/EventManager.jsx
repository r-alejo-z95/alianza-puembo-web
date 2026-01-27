"use client";

import { useState, useMemo, useEffect } from "react";
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
import { AdminEditorPanel } from "@/components/admin/layout/AdminEditorPanel";
import EventForm from "@/components/admin/forms/EventForm";
import { EventRow } from "./table-cells/EventRows";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { useRouter } from "next/navigation";
import { useAdminEventsContext } from "@/components/providers/EventsProvider";
import {
  Loader2,
  Plus,
  ListFilter,
  CalendarCheck,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Search,
  SortAsc,
  SortDesc,
  LayoutGrid,
  Rows,
  Calendar as CalendarIcon,
  ChevronDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { AdminFAB } from "../layout/AdminFAB";
import { ManagerSkeleton } from "../layout/AdminSkeletons";
import RecycleBin from "./RecycleBin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

import { motion, AnimatePresence } from "framer-motion";

export default function EventManager() {
  const {
    events,
    archivedEvents,
    loading,
    loadingArchived,
    isCreatingForm,
    saveEvent,
    archiveEvent,
    archiveEvents,
    restoreEvent,
    restoreEvents,
    permanentlyDeleteEvent,
    permanentlyDeleteEvents,
    emptyRecycleBin,
    fetchArchivedEvents,
  } = useAdminEventsContext();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [successData, setSuccessData] = useState(null);

  // UX States
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "start_time", direction: "asc" });
  const [groupByMonth, setGroupByMonth] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_events_groupByMonth");
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem("admin_events_groupByMonth", JSON.stringify(groupByMonth));
  }, [groupByMonth]);
  const [selectedIds, setSelectedIds] = useState([]);

  const { isLg } = useScreenSize();
  const itemsPerPage = isLg ? 10 : 5;
  const router = useRouter();

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Load archived when bin is opened
  useEffect(() => {
    if (isRecycleBinOpen) {
      fetchArchivedEvents();
    }
  }, [isRecycleBinOpen, fetchArchivedEvents]);

  const handleSave = async (eventData, posterFile) => {
    const result = await saveEvent(eventData, posterFile, selectedEvent);
    if (result.success) {
      setIsFormOpen(false);
      setSelectedEvent(null);
      if (result.formSlug && (eventData.create_form || eventData.regenerate_form)) {
        setSuccessData({ formSlug: result.formSlug, eventTitle: eventData.title });
      }
    }
  };

  const handleDelete = async (eventId) => {
    const success = await archiveEvent(eventId);
    if (success) {
      setSelectedIds(prev => prev.filter(id => id !== eventId));
    }
  };

  const handleBulkArchive = async () => {
    const success = await archiveEvents(selectedIds);
    if (success) setSelectedIds([]);
  };

  // 1. Process search and sort on all events
  const processedEvents = useMemo(() => {
    let result = [...events];

    if (searchTerm) {
      result = result.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    result.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      if (sortConfig.key === "title") {
        valA = valA.toLowerCase(); valB = valB.toLowerCase();
      }
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [events, searchTerm, sortConfig]);

  // 2. Paginate the processed result
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return processedEvents.slice(startIndex, endIndex);
  }, [processedEvents, currentPage, itemsPerPage]);

  // 3. Group ONLY the current page items for visual grouping
  const groupedCurrentItems = useMemo(() => {
    if (!groupByMonth) return { "Resultados": currentItems };

    const groups = {};
    currentItems.forEach(event => {
      const date = parseISO(event.start_time);
      const monthYear = format(date, "MMMM yyyy", { locale: es });
      const capitalizedMonth = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
      
      if (!groups[capitalizedMonth]) groups[capitalizedMonth] = [];
      groups[capitalizedMonth].push(event);
    });
    return groups;
  }, [currentItems, groupByMonth]);

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

  const totalPages = Math.ceil(processedEvents.length / itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.length === currentItems.length && currentItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentItems.map(e => e.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-8">
      <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 md:p-12 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gray-50/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <CalendarIcon className="w-3 h-3" />
              <span>Gestión de Agenda</span>
            </div>
            <CardTitle className="text-3xl font-serif font-bold text-gray-900">
              Listado de Eventos
            </CardTitle>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-full px-6 py-6 font-bold border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
              onClick={() => setIsRecycleBinOpen(true)}
            >
              <Trash2 className="w-5 h-5 lg:mr-2" />
              <span className="hidden lg:inline">Papelera</span>
            </Button>
            <Button
              variant="green"
              className="hidden lg:flex rounded-full px-8 py-6 font-bold shadow-lg shadow-[var(--puembo-green)]/20 transition-all hover:-translate-y-0.5"
              onClick={() => {
                setSelectedEvent(null);
                setIsFormOpen(true);
              }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Añadir Evento
            </Button>
          </div>
        </CardHeader>

        {/* Toolbar: Premium Search & Simple Sort Buttons */}
        <div className="px-8 py-6 border-b border-gray-50 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:max-w-md group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--puembo-green)] transition-colors" />
              <Input 
                placeholder="Buscar por nombre..."
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
            
            <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              <div className="flex items-center bg-gray-50 p-1.5 rounded-full border border-gray-100">
                <Button 
                  variant={sortConfig.key === "title" ? "green" : "ghost"}
                  onClick={() => handleSort("title")}
                  className={cn(
                    "rounded-full h-11 px-6 font-bold text-[10px] uppercase tracking-[0.2em] gap-2 transition-all",
                    sortConfig.key === "title" ? "shadow-lg" : "text-gray-400 hover:bg-gray-100"
                  )}
                >
                  {sortConfig.key === "title" && (
                    sortConfig.direction === "asc" ? <SortAsc className="w-3.5 h-3.5" /> : <SortDesc className="w-3.5 h-3.5" />
                  )}
                  Nombre
                </Button>
                <Button 
                  variant={sortConfig.key === "start_time" ? "green" : "ghost"}
                  onClick={() => handleSort("start_time")}
                  className={cn(
                    "rounded-full h-11 px-6 font-bold text-[10px] uppercase tracking-[0.2em] gap-2 transition-all",
                    sortConfig.key === "start_time" ? "shadow-lg" : "text-gray-400 hover:bg-gray-100"
                  )}
                >
                  {sortConfig.key === "start_time" && (
                    sortConfig.direction === "asc" ? <SortAsc className="w-3.5 h-3.5" /> : <SortDesc className="w-3.5 h-3.5" />
                  )}
                  Fecha
                </Button>
              </div>

              <div className="h-8 w-px bg-gray-100 mx-2 hidden lg:block" />

              <Button 
                variant={groupByMonth ? "green" : "outline"} 
                className={cn(
                  "rounded-full h-14 px-8 font-bold text-[10px] uppercase tracking-[0.2em] gap-3 transition-all", 
                  !groupByMonth && "border-gray-100 text-gray-500 hover:bg-gray-50"
                )}
                onClick={() => setGroupByMonth(!groupByMonth)}
              >
                {groupByMonth ? <LayoutGrid className="w-4 h-4" /> : <Rows className="w-4 h-4" />}
                {groupByMonth ? "Agrupado" : "Lista Plana"}
              </Button>
            </div>
          </div>

          {/* Premium Floating Bulk Actions Bar */}
          {selectedIds.length > 0 && (
            <div className="mt-6 p-4 bg-gray-900 rounded-full flex items-center justify-between animate-in slide-in-from-top-4 zoom-in-95 duration-500 shadow-2xl ring-4 ring-black/5">
              <div className="flex items-center gap-5 pl-4">
                <div className="w-12 h-12 bg-[var(--puembo-green)] rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/20 animate-pulse">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-white">{selectedIds.length} seleccionados</span>
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em]">Gestión masiva</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  className="text-gray-400 hover:text-white hover:bg-white/5 rounded-full font-bold text-[10px] uppercase tracking-widest h-12 px-8"
                  onClick={() => setSelectedIds([])}
                >
                  Cancelar
                </Button>
                <Button 
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full font-bold text-[10px] uppercase tracking-widest px-10 h-12 gap-3 shadow-xl transition-all hover:scale-105 active:scale-95"
                  onClick={handleBulkArchive}
                >
                  <Trash2 className="w-4 h-4" />
                  Mover a Papelera
                </Button>
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-0">
          {loading ? (
            <ManagerSkeleton rows={itemsPerPage} columns={7} />
          ) : processedEvents.length === 0 ? (
            <div className="py-32 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <CalendarCheck className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-gray-400 font-light italic text-lg font-serif px-8">
                {searchTerm ? "No se encontraron resultados para tu búsqueda." : "No hay eventos agendados todavía."}
              </p>
            </div>
          ) : (
            <div id="event-table">
              {/* Desktop screens */}
              <div className="hidden lg:block overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="hover:bg-transparent border-b border-gray-100">
                      <TableHead className="px-8 py-6 w-[80px]">
                        <Checkbox 
                          checked={selectedIds.length === currentItems.length && currentItems.length > 0}
                          onCheckedChange={toggleSelectAll}
                          className="rounded-md border-gray-300 data-[state=checked]:bg-[var(--puembo-green)] data-[state=checked]:border-[var(--puembo-green)] scale-110"
                        />
                      </TableHead>
                      <TableHead className="px-4 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Título</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Detalles</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Fecha y Hora</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">Registro</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">Autor</TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(groupedCurrentItems).map(([group, groupEvents]) => (
                      <React.Fragment key={group}>
                        {groupByMonth && (
                          <TableRow className="bg-white hover:bg-white border-none">
                            <TableCell colSpan={7} className="px-8 pt-12 pb-4">
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
                        {groupEvents.map((event) => (
                          <EventRow
                            key={event.id}
                            event={event}
                            isSelected={selectedIds.includes(event.id)}
                            onSelect={() => toggleSelect(event.id)}
                            onEdit={() => {
                              setSelectedEvent(event);
                              setIsFormOpen(true);
                            }}
                            onDelete={() => handleDelete(event.id)}
                            compact={false}
                          />
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile screens */}
              <div className="lg:hidden p-6 space-y-12">
                 {Object.entries(groupedCurrentItems).map(([group, groupEvents]) => (
                   <div key={group} className="space-y-6">
                      {groupByMonth && (
                        <div className="flex items-center gap-4 px-2 pt-4">
                          <div className="h-px w-8 bg-[var(--puembo-green)]" />
                          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                            {group}
                          </span>
                        </div>
                      )}
                      {groupEvents.map((event) => (
                        <EventRow
                          key={event.id}
                          event={event}
                          isSelected={selectedIds.includes(event.id)}
                          onSelect={() => toggleSelect(event.id)}
                          onEdit={() => {
                            setSelectedEvent(event);
                            setIsFormOpen(true);
                          }}
                          onDelete={() => handleDelete(event.id)}
                          compact={true}
                        />
                      ))}
                   </div>
                 ))}
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

      <AdminEditorPanel
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={
          <>
            {selectedEvent?.id ? "Ajustar" : "Programar"} <br />
            <span className="text-[var(--puembo-green)] italic">Actividad</span>
          </>
        }
      >
        <div className="relative">
          {isCreatingForm && (
            <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
              <div className="flex flex-col gap-6 justify-center items-center bg-white p-12 rounded-[3rem] shadow-2xl scale-90 md:scale-100">
                <Loader2 className="h-16 w-16 animate-spin text-[var(--puembo-green)]" />
                <div className="space-y-2 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--puembo-green)]">
                    Generando Evento Inteligente
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium italic">
                    Sincronizando con Google Workspace...
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="md:p-12 bg-white">
            <EventForm
              event={selectedEvent}
              onSave={handleSave}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      </AdminEditorPanel>

      {/* Success Modal */}
      <Dialog open={!!successData} onOpenChange={() => setSuccessData(null)}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-[var(--puembo-green)] p-10 text-white flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <DialogTitle className="text-3xl font-serif font-bold text-center text-white leading-tight">
              ¡Operación <br /> Exitosa!
            </DialogTitle>
          </div>

          <div className="p-10 space-y-8">
            <DialogDescription className="text-center text-gray-600 text-base leading-relaxed">
              El evento <span className="font-bold text-gray-900 italic">"{successData?.eventTitle}"</span> ya está disponible y el registro ha sido automatizado.
            </DialogDescription>

            <div className="grid grid-cols-1 gap-4">
              <Button
                variant="green"
                className="rounded-full py-8 font-bold shadow-xl shadow-green-200 gap-3 text-sm uppercase tracking-widest"
                onClick={() => {
                  router.push(`/admin/formularios/builder?slug=${successData.formSlug}`);
                  setSuccessData(null);
                }}
              >
                Configurar Registro <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                className="rounded-full py-8 font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all text-xs uppercase tracking-widest"
                onClick={() => setSuccessData(null)}
              >
                Volver al listado
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <RecycleBin
        open={isRecycleBinOpen}
        onOpenChange={setIsRecycleBinOpen}
        type="events"
        items={archivedEvents}
        onRestore={restoreEvent}
        onDelete={permanentlyDeleteEvent}
        onBulkRestore={restoreEvents}
        onBulkDelete={permanentlyDeleteEvents}
        onEmptyTrash={emptyRecycleBin}
        loading={loadingArchived}
      />

      <AdminFAB
        onClick={() => {
          setSelectedEvent(null);
          setIsFormOpen(true);
        }}
        label="Nuevo Evento"
      />
    </div>
  );
}

import React from "react";