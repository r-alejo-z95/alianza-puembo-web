'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import EventForm from '@/components/admin/forms/EventForm';
import { toast } from 'sonner';
import { OverflowCell } from './table-cells/OverflowCell';
import { EventRow } from './table-cells/EventRows';

export default function EventManager() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const supabase = createClient();

    const fetchEvents = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('start_time', { ascending: false });

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
            poster_url
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
                                        <TableHead className="font-bold">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {events.map((event) => (
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
                        </div>

                        {/* Pantallas pequeñas */}
                        <div className="lg:hidden space-y-4">
                            <div className="w-full">
                                {events.map((event) => (
                                    <EventRow
                                        key={event.id}
                                        event={event}
                                        onEdit={() => { setSelectedEvent(event); setIsFormOpen(true); }}
                                        onDelete={() => handleDelete(event.id)}
                                        compact={true}
                                    />
                                ))}
                            </div>
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