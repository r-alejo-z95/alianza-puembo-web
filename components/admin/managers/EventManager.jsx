'use client';

import { useState, useMemo } from 'react';
import { useScreenSize } from '@/lib/hooks/useScreenSize';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EventForm from '@/components/admin/forms/EventForm';
import { EventRow } from './table-cells/EventRows';
import { PaginationControls } from "@/components/shared/PaginationControls";
import { useRouter } from 'next/navigation';
import { useAdminEventsContext } from '@/components/providers/EventsProvider';
import { Loader2 } from 'lucide-react';

export default function EventManager() {
    const {
        events,
        loading,
        isCreatingForm,
        saveEvent,
        deleteEvent
    } = useAdminEventsContext();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const { isLg } = useScreenSize();
    const itemsPerPage = isLg ? 5 : 3;

    const router = useRouter();

    const handleSave = async (eventData, posterFile) => {
        const result = await saveEvent(eventData, posterFile, selectedEvent);

        if (result.success) {
            setIsFormOpen(false);
            setSelectedEvent(null);

            // Navigate to form editor if a form was created
            if (result.formId && (eventData.create_form || eventData.regenerate_form)) {
                router.push(`/admin/formularios?editFormId=${result.formId}`);
            }
        }
    };

    const handleDelete = async (eventId) => {
        const success = await deleteEvent(eventId);
        if (success) {
            // Reset to first page if current page becomes empty
            const newTotalPages = Math.ceil((events.length - 1) / itemsPerPage);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(1);
            }
        }
    };

    const totalPages = useMemo(() => Math.ceil(events.length / itemsPerPage), [events.length, itemsPerPage]);
    const currentEvents = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return events.slice(startIndex, endIndex);
    }, [events, currentPage, itemsPerPage]);

    return (
        <Card className="mb-16">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Lista de Eventos</CardTitle>
                <Button onClick={() => { setSelectedEvent(null); setIsFormOpen(true); }}>Añadir Evento</Button>
            </CardHeader>
            <CardContent className="max-w-full">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="h-8 w-8 animate-spin text-[var(--puembo-green)]" />
                    </div>
                ) : (
                    <div id='event-table'>
                        {/* Large screens */}
                        <div className="hidden lg:block overflow-x-auto">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-bold">Título</TableHead>
                                        <TableHead className="font-bold">Descripción</TableHead>
                                        <TableHead className="font-bold">Fecha</TableHead>
                                        <TableHead className="font-bold">Hora</TableHead>
                                        <TableHead className="font-bold">Ubicación</TableHead>
                                        <TableHead className="font-bold">Póster</TableHead>
                                        <TableHead className="font-bold">Link de Registro</TableHead>
                                        <TableHead className="font-bold">Autor</TableHead>
                                        <TableHead className="font-bold">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentEvents.map((event) => (
                                        <EventRow
                                            key={event.id}
                                            event={event}
                                            onEdit={() => { setSelectedEvent(event); setIsFormOpen(true); }}
                                            onDelete={() => handleDelete(event.id)}
                                            compact={false}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                            {totalPages > 1 && (
                                <PaginationControls
                                    hasNextPage={currentPage < totalPages}
                                    totalPages={totalPages}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                />
                            )}
                        </div>

                        {/* Small screens */}
                        <div className="lg:hidden space-y-4">
                            <div className="w-full">
                                {currentEvents.map((event) => (
                                    <EventRow
                                        key={event.id}
                                        event={event}
                                        onEdit={() => { setSelectedEvent(event); setIsFormOpen(true); }}
                                        onDelete={() => handleDelete(event.id)}
                                        compact={true}
                                    />
                                ))}
                            </div>
                            {totalPages > 1 && (
                                <PaginationControls
                                    hasNextPage={currentPage < totalPages}
                                    totalPages={totalPages}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                />
                            )}
                        </div>
                    </div>
                )}
            </CardContent>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedEvent?.id ? 'Editar Evento' : 'Crear Nuevo Evento'}</DialogTitle>
                    </DialogHeader>
                    {isCreatingForm && (
                        <div className="flex flex-col gap-4 justify-center items-center h-full">
                            <Loader2 className="h-10 w-10 animate-spin text-[var(--puembo-green)]" />
                        </div>
                    )}
                    <EventForm
                        event={selectedEvent}
                        onSave={handleSave}
                        onCancel={() => setIsFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </Card>
    );
}