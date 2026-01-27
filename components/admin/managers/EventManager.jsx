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
  ExternalLink,
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
  DialogFooter,
} from "@/components/ui/dialog";

export default function EventManager() {
  const {
    events,
    archivedEvents,
    loading,
    loadingArchived,
    isCreatingForm,
    saveEvent,
    archiveEvent,
    restoreEvent,
    permanentlyDeleteEvent,
    fetchArchivedEvents,
  } = useAdminEventsContext();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [successData, setSuccessData] = useState(null);

  const { isLg } = useScreenSize();
  const itemsPerPage = isLg ? 10 : 5;

  const router = useRouter();

  // Cargar archivados cuando se abre la papelera
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

      // Si se creó o regeneró un formulario, mostramos el modal de éxito
      if (
        result.formSlug &&
        (eventData.create_form || eventData.regenerate_form)
      ) {
        setSuccessData({
          formSlug: result.formSlug,
          eventTitle: eventData.title,
        });
      }
    }
  };

  const handleDelete = async (eventId) => {
    const success = await archiveEvent(eventId);
    if (success) {
      const newTotalPages = Math.ceil((events.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(1);
      }
    }
  };

  const totalPages = useMemo(
    () => Math.ceil(events.length / itemsPerPage),
    [events.length, itemsPerPage],
  );
  const currentEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return events.slice(startIndex, endIndex);
  }, [events, currentPage, itemsPerPage]);

  return (
    <div className="space-y-8">
      <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 md:p-12 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gray-50/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <ListFilter className="w-3 h-3" />
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

        <CardContent className="p-0">
          {loading ? (
            <ManagerSkeleton rows={itemsPerPage} columns={6} />
          ) : events.length === 0 ? (
            <div className="py-32 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <CalendarCheck className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-gray-400 font-light italic">
                No hay eventos agendados todavía.
              </p>
            </div>
          ) : (
            <div id="event-table">
              {/* Desktop screens */}
              <div className="hidden lg:block overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="hover:bg-transparent border-b border-gray-100">
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Título
                      </TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Detalles
                      </TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Fecha y Hora
                      </TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
                        Registro
                      </TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
                        Autor
                      </TableHead>
                      <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentEvents.map((event) => (
                      <EventRow
                        key={event.id}
                        event={event}
                        onEdit={() => {
                          setSelectedEvent(event);
                          setIsFormOpen(true);
                        }}
                        onDelete={() => handleDelete(event.id)}
                        compact={false}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile screens */}
              <div className="lg:hidden p-6 space-y-6">
                {currentEvents.map((event) => (
                  <EventRow
                    key={event.id}
                    event={event}
                    onEdit={() => {
                      setSelectedEvent(event);
                      setIsFormOpen(true);
                    }}
                    onDelete={() => handleDelete(event.id)}
                    compact={true}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="p-8 border-t border-gray-50">
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
          {/* Loader Fijo y mejorado */}
          {isCreatingForm && (
            <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
              <div className="flex flex-col gap-6 justify-center items-center bg-white p-12 rounded-[3rem] shadow-2xl scale-90 md:scale-100">
                <Loader2 className="h-16 w-16 animate-spin text-[var(--puembo-green)]" />
                <div className="space-y-2 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--puembo-green)]">
                    Creando Evento + Formulario de Registro
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium">
                    Creando Hoja de Cálculo y Carpeta Drive...
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="md:p-12">
            <EventForm
              event={selectedEvent}
              onSave={handleSave}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      </AdminEditorPanel>

      {/* Success Modal - Mejor UX post-creación */}
      <Dialog open={!!successData} onOpenChange={() => setSuccessData(null)}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-[var(--puembo-green)] p-8 text-white flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-serif font-bold text-center">
              ¡Evento y Registro Listos!
            </DialogTitle>
          </div>

          <div className="p-8 space-y-6">
            <DialogDescription className="text-center text-gray-600 text-base leading-relaxed">
              El evento <span className="font-bold text-gray-900 italic">"{successData?.eventTitle}"</span> se ha programado correctamente y el formulario de registro automático ha sido vinculado.
            </DialogDescription>

            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="green"
                className="rounded-full py-7 font-bold shadow-lg shadow-green-200 gap-2"
                onClick={() => {
                  router.push(`/admin/formularios/builder?slug=${successData.formSlug}`);
                  setSuccessData(null);
                }}
              >
                Personalizar Formulario <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                className="rounded-full py-7 font-bold text-gray-400 hover:text-gray-600"
                onClick={() => setSuccessData(null)}
              >
                Permanecer en Eventos
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recycle Bin Dialog */}
      <RecycleBin
        open={isRecycleBinOpen}
        onOpenChange={setIsRecycleBinOpen}
        type="events"
        items={archivedEvents}
        onRestore={restoreEvent}
        onDelete={permanentlyDeleteEvent}
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