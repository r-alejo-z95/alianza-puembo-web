'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useIsLargeScreen } from '@/lib/hooks/useIsLargeScreen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EventForm from '@/components/admin/forms/EventForm';
import { toast } from 'sonner';
import { EventRow } from './table-cells/EventRows';
import { PaginationControls } from "@/components/admin/PaginationControls";

export default function EventManager() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const isLargeScreen = useIsLargeScreen();
    const itemsPerPage = isLargeScreen ? 5 : 3;

    const supabase = createClient();

    const fetchEvents = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('start_time', { ascending: true });

        if (error) {
            console.error('Error fetching events:', error);
            toast.error('Error al cargar los eventos.');
        } else {
            setEvents(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleSave = async (eventData, posterFile) => {
        const { data: { user } } = await supabase.auth.getUser();
        let poster_url = selectedEvent?.poster_url || null;

        let poster_w = selectedEvent?.poster_w || null;
        let poster_h = selectedEvent?.poster_h || null;

        if (posterFile) {
            // If updating an existing event and a new poster is provided, delete the old one
            if (selectedEvent && selectedEvent.poster_url) {
                const oldFileName = selectedEvent.poster_url.split('/').pop();
                const { error: deleteOldStorageError } = await supabase.storage
                    .from('event-posters')
                    .remove([oldFileName]);

                if (deleteOldStorageError) {
                    console.error('Error deleting old poster from storage:', deleteOldStorageError);
                    toast.error('Error al eliminar el póster antiguo del almacenamiento.');
                    // Continue with the new upload even if old deletion fails
                }
            }

            const fileName = `${Date.now()}_${posterFile.file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('event-posters')
                .upload(fileName, posterFile.file);

            if (uploadError) {
                console.error('Error uploading poster:', uploadError);
                toast.error('Error al subir el póster del evento.');
                return;
            } else {
                const { data: urlData } = supabase.storage.from('event-posters').getPublicUrl(uploadData.path);
                poster_url = urlData.publicUrl;
                poster_w = posterFile.width;
                poster_h = posterFile.height;
            }
        }

        const dataToSave = {
            ...eventData,
            start_time: new Date(eventData.start_time).toISOString(),
            end_time: eventData.end_time ? new Date(eventData.end_time).toISOString() : null,
            poster_url,
            poster_w,
            poster_h,
            registration_link: eventData.registration_link || null
        };

        if (selectedEvent) {
            const { error } = await supabase.from('events').update(dataToSave).eq('id', selectedEvent.id);
            if (error) {
                console.error('Error updating event:', error)
                toast.error('Error al actualizar el evento.');
            } else {
                toast.success('Evento actualizado con éxito.');
            }
        } else {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase.from('events').insert([{ ...dataToSave, user_id: user?.id }]);
            if (error) {
                console.error('Error creating event:', error);
                toast.error('Error al crear el evento.');
            } else {
                toast.success('Evento creado con éxito.');
            }
        }
        setIsFormOpen(false);
        fetchEvents();
    };

    const handleDelete = async (eventId) => {
        // Fetch the event to get the poster_url before deleting
        const { data: eventToDelete, error: fetchError } = await supabase
            .from('events')
            .select('poster_url')
            .eq('id', eventId)
            .single();

        if (fetchError) {
            console.error('Error fetching event for deletion:', fetchError);
            toast.error('Error al obtener el evento para eliminar.');
            return;
        }

        // If there's a poster_url, delete the file from storage
        if (eventToDelete.poster_url) {
            const fileName = eventToDelete.poster_url.split('/').pop();
            const { error: deleteStorageError } = await supabase.storage
                .from('event-posters')
                .remove([fileName]);

            if (deleteStorageError) {
                console.error('Error deleting poster from storage:', deleteStorageError);
                toast.error('Error al eliminar el póster del almacenamiento.');
                // Continue to delete the event record even if storage deletion fails
            }
        }

        // Delete the event record from the database
        const { error: deleteDbError } = await supabase.from('events').delete().eq('id', eventId);
        if (deleteDbError) {
            console.error('Error deleting event from database:', deleteDbError);
            toast.error('Error al eliminar el evento de la base de datos.');
        } else {
            toast.success('Evento eliminado con éxito.');
        }
        fetchEvents();
    };

    const totalPages = useMemo(() => Math.ceil(events.length / itemsPerPage), [events.length, itemsPerPage]);
    const currentEvents = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return events.slice(startIndex, endIndex);
    }, [events, currentPage, itemsPerPage]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Lista de Eventos</CardTitle>
                <Button onClick={() => { setSelectedEvent(null); setIsFormOpen(true); }}>Añadir Evento</Button>
            </CardHeader>
            <CardContent className="max-w-full">
                {loading ? (
                    <p>Cargando eventos...</p>
                ) : (
                    <div id='event-table'>
                        {/* Pantallas grandes */}
                        <div className="hidden lg:block overflow-x-auto">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-bold">Título</TableHead>
                                        <TableHead className="font-bold">Descripción</TableHead>
                                        <TableHead className="font-bold">Fecha</TableHead>
                                        <TableHead className="font-bold">Hora</TableHead>
                                        <TableHead className="font-bold">Póster</TableHead>
                                        <TableHead className="font-bold">Link de Registro</TableHead>
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

                        {/* Pantallas pequeñas */}
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedEvent ? 'Editar Evento' : 'Añadir Nuevo Evento'}</DialogTitle>
                    </DialogHeader>
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