"use client";

import { useState, useMemo } from "react";
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
import { Loader2, Plus, ListFilter, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils.ts";

export default function EventManager() {
  const { events, loading, isCreatingForm, saveEvent, deleteEvent } =
    useAdminEventsContext();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { isLg } = useScreenSize();
  const itemsPerPage = isLg ? 10 : 5;

  const router = useRouter();

  const handleSave = async (eventData, posterFile) => {
    const result = await saveEvent(eventData, posterFile, selectedEvent);

    if (result.success) {
      setIsFormOpen(false);
      setSelectedEvent(null);

      if (
        result.formId &&
        (eventData.create_form || eventData.regenerate_form)
      ) {
        router.push(`/admin/formularios?editFormId=${result.formId}`);
      }
    }
  };

  const handleDelete = async (eventId) => {
    const success = await deleteEvent(eventId);
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
          <Button
            variant="green"
            className="rounded-full px-8 py-6 font-bold shadow-lg shadow-[var(--puembo-green)]/20 transition-all hover:-translate-y-0.5"
            onClick={() => {
              setSelectedEvent(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Añadir Evento
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-[var(--puembo-green)] opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
                Cargando Agenda
              </p>
            </div>
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
          {isCreatingForm && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col gap-4 justify-center items-center">
              <Loader2 className="h-12 w-12 animate-spin text-[var(--puembo-green)]" />

              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">
                Sincronizando Formulario
              </p>
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
    </div>
  );
}
