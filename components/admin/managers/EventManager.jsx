'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useScreenSize } from '@/lib/hooks/useScreenSize';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EventForm from '@/components/admin/forms/EventForm';
import { toast } from 'sonner';
import { createFormAndSheet, regenerateFormAndSheet } from '@/lib/actions';
import { EventRow } from './table-cells/EventRows';
import { PaginationControls } from "@/components/shared/PaginationControls";
import { useRouter } from 'next/navigation';

export default function EventManager() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreatingForm, setIsCreatingForm] = useState(false);

    const { isLg } = useScreenSize();
    const itemsPerPage = isLg ? 5 : 3;

    const supabase = createClient();
    const router = useRouter();

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

        // Manejar la subida del póster
        if (posterFile) {
            // Si se está actualizando un evento existente y se proporciona un nuevo póster, eliminar el anterior
            if (selectedEvent && selectedEvent.poster_url) {
                const oldFileName = selectedEvent.poster_url.split('/').pop();
                const { error: deleteOldStorageError } = await supabase.storage
                    .from('event-posters')
                    .remove([oldFileName]);

                if (deleteOldStorageError) {
                    console.error('Error deleting old poster from storage:', deleteOldStorageError);
                    toast.error('Error al eliminar el póster antiguo del almacenamiento.');
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

        // Preparar los datos básicos del evento
        let dataToSave = {
            title: eventData.title,
            description: eventData.description || null,
            start_time: new Date(eventData.start_time).toISOString(),
            end_time: eventData.end_time ? new Date(eventData.end_time).toISOString() : null,
            poster_url,
            poster_w,
            poster_h,
            registration_link: selectedEvent?.registration_link || null, // Mantener el link existente por defecto
            form_id: selectedEvent?.form_id || null, // Mantener el form_id existente
            create_form: false // Siempre false en la BD, es solo para lógica del frontend
        };

        let createdFormId = null;
        let shouldCreateForm = false;
        let shouldNavigateToForm = false;

        // Determinar si necesitamos crear un formulario
        if (!selectedEvent && eventData.create_form) {
            // Evento nuevo con formulario
            shouldCreateForm = true;
            shouldNavigateToForm = true;
        } else if (selectedEvent && !selectedEvent.registration_link && eventData.create_form) {
            // Evento existente sin formulario, ahora se quiere crear
            shouldCreateForm = true;
            shouldNavigateToForm = true;
        } else if (selectedEvent && selectedEvent.registration_link && eventData.regenerate_form) {
            // Evento existente con formulario, se quiere regenerar
            shouldCreateForm = true;
            shouldNavigateToForm = true;
        }

        // Crear el formulario si es necesario
        if (shouldCreateForm) {
            setIsCreatingForm(true);
            try {
                let formCreationResult;

                if (selectedEvent && selectedEvent.registration_link && eventData.regenerate_form) {
                    // Para regeneración: extraer el slug del registration_link y regenerar
                    const currentSlug = selectedEvent.registration_link.split('/').pop();
                    formCreationResult = await regenerateFormAndSheet(currentSlug, eventData.title);
                } else {
                    // Para nuevos formularios: crear normalmente
                    formCreationResult = await createFormAndSheet(eventData.title);
                }

                const { success, formId, formUrl, error: formCreationError } = formCreationResult;

                if (success) {
                    dataToSave.registration_link = formUrl;
                    dataToSave.form_id = formId;
                    createdFormId = formId;

                    if (selectedEvent && selectedEvent.registration_link && eventData.regenerate_form) {
                        toast.success('Formulario regenerado con éxito. Se ha creado un nuevo Google Sheet con la misma URL.');
                    } else {
                        toast.success('Formulario de registro y hoja de cálculo creados con éxito.');
                    }
                } else {
                    console.error('Error creating form and sheet:', formCreationError);
                    toast.error(`Error al crear el formulario de registro: ${formCreationError}`);
                    setIsCreatingForm(false);
                    return;
                }
            } catch (error) {
                console.error('Unexpected error during form and sheet creation:', error);
                toast.error('Ocurrió un error inesperado al crear el formulario de registro.');
                setIsCreatingForm(false);
                return;
            }
            setIsCreatingForm(false);
        }

        // Guardar o actualizar el evento
        if (selectedEvent) {
            const { data: updatedData, error } = await supabase
                .from('events')
                .update(dataToSave)
                .eq('id', selectedEvent.id)
                .select()
                .single();

            if (error) {
                console.error('Error updating event:', error);
                console.error('Error details:', JSON.stringify(error, null, 2));
                toast.error(`Error al actualizar el evento: ${error.message || 'Error desconocido'}`);
                return;
            } else {
                toast.success('Evento actualizado con éxito.');
            }
        } else {
            const { data: createdData, error } = await supabase
                .from('events')
                .insert([{ ...dataToSave, user_id: user?.id }])
                .select()
                .single();

            if (error) {
                console.error('Error creating event:', error);
                console.error('Error details:', JSON.stringify(error, null, 2));
                toast.error(`Error al crear el evento: ${error.message || 'Error desconocido'}`);
                return;
            } else {
                toast.success('Evento creado con éxito.');
            }
        }

        setIsFormOpen(false);
        await fetchEvents();

        // Navegar al editor de formularios si se creó un formulario
        if (shouldNavigateToForm && createdFormId) {
            router.push(`/admin/formularios?editFormId=${createdFormId}`);
        }
    };

    const handleDelete = async (eventId) => {
        // Obtener el evento para conseguir el poster_url antes de eliminarlo
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

        // Si hay un poster_url, eliminar el archivo del almacenamiento
        if (eventToDelete.poster_url) {
            const fileName = eventToDelete.poster_url.split('/').pop();
            const { error: deleteStorageError } = await supabase.storage
                .from('event-posters')
                .remove([fileName]);

            if (deleteStorageError) {
                console.error('Error deleting poster from storage:', deleteStorageError);
                toast.error('Error al eliminar el póster del almacenamiento.');
            }
        }

        // Eliminar el registro del evento de la base de datos
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
        <Card className="mb-16">
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedEvent ? 'Editar Evento' : 'Añadir Nuevo Evento'}</DialogTitle>
                    </DialogHeader>
                    {isCreatingForm && (
                        <div className="flex flex-col gap-4 justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-(--puembo-green)" />
                            <p>Creando formulario de registro... Esto puede tomar unos segundos.</p>
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