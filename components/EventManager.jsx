'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import EventForm from './EventForm';

export default function EventManager() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
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
      if (error) console.error('Error updating event:', error);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('events').insert([{ ...dataToSave, user_id: user?.id }]);
      if (error) console.error('Error creating event:', error);
    }
    setIsFormOpen(false);
    fetchEvents();
  };

  const handleDelete = async (eventId) => {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) console.error('Error deleting event:', error);
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
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Título</TableHead>
                  <TableHead className="font-bold">Descripción</TableHead>
                  <TableHead className="font-bold">Fecha de Inicio</TableHead>
                  <TableHead className="font-bold">Fecha de Fin</TableHead>
                  <TableHead className="w-32 font-bold">Póster URL</TableHead>
                  <TableHead className="font-bold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="overflow-hidden text-ellipsis whitespace-nowrap">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>{event.title}</span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs break-words">
                            <p>{event.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="overflow-hidden text-ellipsis whitespace-nowrap">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>{event.description}</span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs break-words">
                            <p>{event.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>{new Date(event.start_time).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
                    <TableCell>{event.end_time ? new Date(event.end_time).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}</TableCell>
                    <TableCell className="w-32 max-w-32 overflow-hidden text-ellipsis whitespace-nowrap">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>{event.poster_url || 'N/A'}</span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs break-words">
                            <p>{event.poster_url || 'N/A'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="min-w-[150px]">
                      <Button variant="outline" size="sm" className="mr-2" onClick={() => { setSelectedEvent(event); setIsFormOpen(true); }}>Editar</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">Eliminar</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente el evento de nuestros servidores.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(event.id)}>Continuar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
