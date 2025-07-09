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
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

        if (posterFile) {
            const fileName = `${Date.now()}_${posterFile.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('event-posters')
                .upload(fileName, posterFile);

            if (uploadError) {
                console.error('Error uploading poster:', uploadError);
                toast.error('Error al subir el póster del evento.');
                return;
            } else {
                const { data: urlData } = supabase.storage.from('event-posters').getPublicUrl(uploadData.path);
                poster_url = urlData.publicUrl;
            }
        }

        const dataToSave = {
            ...eventData,
            start_time: new Date(eventData.start_time).toISOString(),
            end_time: eventData.end_time ? new Date(eventData.end_time).toISOString() : null,
            poster_url,
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

        const { error } = await supabase.from('events').delete().eq('id', eventId);
        if (error) {
            console.error('Error deleting event:', error);
            toast.error('Error al eliminar el evento.');
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
                                <div className="flex justify-end space-x-2 mt-4">
                                    <Button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        variant="outline"
                                        size="icon"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        variant="outline"
                                        size="icon"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
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
                                <div className="flex justify-end space-x-2 mt-4">
                                    <Button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        variant="outline"
                                        size="icon"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        variant="outline"
                                        size="icon"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
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