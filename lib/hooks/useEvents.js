'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { createFormAndSheet, regenerateFormAndSheet } from '@/lib/actions';

export function useEvents({ initialEvents = [] } = {}) {
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(!initialEvents.length);
  const [isCreatingForm, setIsCreatingForm] = useState(false);

  const supabase = createClient();

  const fetchEvents = useCallback(async () => {
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
  }, [supabase]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const saveEvent = useCallback(async (eventData, posterFile, selectedEvent = null) => {
    const { data: { user } } = await supabase.auth.getUser();
    let poster_url = selectedEvent?.poster_url || null;
    let poster_w = selectedEvent?.poster_w || null;
    let poster_h = selectedEvent?.poster_h || null;

    // Handle poster upload
    if (posterFile) {
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
        return { success: false };
      } else {
        const { data: urlData } = supabase.storage.from('event-posters').getPublicUrl(uploadData.path);
        poster_url = urlData.publicUrl;
        poster_w = posterFile.width;
        poster_h = posterFile.height;
      }
    }

    // Prepare event data
    // Note: eventData.start_time and eventData.end_time are already ISO strings
    // generated in EventForm.jsx using ecuadorToUTC logic.
    let dataToSave = {
      title: eventData.title,
      description: eventData.description || null,
      start_time: eventData.start_time,
      end_time: eventData.end_time,
      poster_url,
      poster_w,
      poster_h,
      registration_link: selectedEvent?.registration_link || null,
      form_id: selectedEvent?.form_id || null,
      all_day: eventData.all_day || false,
      is_multi_day: eventData.is_multi_day || false,
      color: eventData.color || 'sky',
      location: eventData.location || null,
      create_form: false
    };

    let shouldCreateForm = false;
    let createdFormId = null;

    // Determine if we need to create a form
    if (!selectedEvent?.id && eventData.create_form) {
      shouldCreateForm = true;
    } else if (selectedEvent?.id && !selectedEvent.registration_link && eventData.create_form) {
      shouldCreateForm = true;
    } else if (selectedEvent?.id && selectedEvent.registration_link && eventData.regenerate_form) {
      shouldCreateForm = true;
    }

    // Create form if necessary
    if (shouldCreateForm) {
      setIsCreatingForm(true);
      try {
        let formCreationResult;

        if (selectedEvent?.registration_link && eventData.regenerate_form) {
          const currentSlug = selectedEvent.registration_link.split('/').pop();
          formCreationResult = await regenerateFormAndSheet(currentSlug, eventData.title);
        } else {
          formCreationResult = await createFormAndSheet(eventData.title);
        }

        const { success, formId, formUrl, error: formCreationError } = formCreationResult;

        if (success) {
          dataToSave.registration_link = formUrl;
          dataToSave.form_id = formId;
          createdFormId = formId;
          toast.success(eventData.regenerate_form ? 'Formulario regenerado con éxito.' : 'Formulario de registro creado con éxito.');
        } else {
          console.error('Error creating form and sheet:', formCreationError);
          toast.error(`Error al crear el formulario de registro: ${formCreationError}`);
          setIsCreatingForm(false);
          return { success: false };
        }
      } catch (error) {
        console.error('Unexpected error during form and sheet creation:', error);
        toast.error('Ocurrió un error inesperado al crear el formulario de registro.');
        setIsCreatingForm(false);
        return { success: false };
      }
      setIsCreatingForm(false);
    }

    // Save or update event
    if (selectedEvent?.id) {
      const { error } = await supabase
        .from('events')
        .update(dataToSave)
        .eq('id', selectedEvent.id);

      if (error) {
        console.error('Error updating event:', error);
        toast.error(`Error al actualizar el evento: ${error.message || 'Error desconocido'}`);
        return { success: false };
      } else {
        toast.success('Evento actualizado con éxito.');
      }
    } else {
      const { error } = await supabase
        .from('events')
        .insert([{ ...dataToSave, user_id: user?.id }]);

      if (error) {
        console.error('Error creating event:', error);
        toast.error(`Error al crear el evento: ${error.message || 'Error desconocido'}`);
        return { success: false };
      } else {
        toast.success('Evento creado con éxito.');
      }
    }

    await fetchEvents();
    return { success: true, formId: createdFormId };
  }, [supabase, fetchEvents]);

  const updateEvent = useCallback(async (updatedEvent) => {
    const eventToUpdate = updatedEvent.originalEvent || updatedEvent;

    const { error } = await supabase
      .from('events')
      .update({
        start_time: updatedEvent.start.toISOString(),
        end_time: updatedEvent.end.toISOString(),
      })
      .eq('id', eventToUpdate.id);

    if (error) {
      console.error('Error updating event:', error);
      toast.error('Error al mover el evento.');
      return false;
    } else {
      toast.success(`Evento "${updatedEvent.title}" movido`);
      await fetchEvents();
      return true;
    }
  }, [supabase, fetchEvents]);

  const deleteEvent = useCallback(async (eventId) => {
    // Get the event to get poster_url before deleting it
    const { data: eventToDelete, error: fetchError } = await supabase
      .from('events')
      .select('poster_url')
      .eq('id', eventId)
      .single();

    if (fetchError) {
      console.error('Error fetching event for deletion:', fetchError);
      toast.error('Error al obtener el evento para eliminar.');
      return false;
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
      }
    }

    // Delete the event record from database
    const { error: deleteDbError } = await supabase.from('events').delete().eq('id', eventId);
    if (deleteDbError) {
      console.error('Error deleting event from database:', deleteDbError);
      toast.error('Error al eliminar el evento de la base de datos.');
      return false;
    } else {
      toast.success('Evento eliminado con éxito.');
      await fetchEvents();
      return true;
    }
  }, [supabase, fetchEvents]);

  // Transform events for calendar format
  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description,
    start: new Date(event.start_time),
    end: event.end_time ? new Date(event.end_time) : new Date(event.start_time),
    allDay: event.all_day || false,
    is_multi_day: event.is_multi_day || false,
    color: event.color || 'sky',
    location: event.location,
    originalEvent: event
  }));

  return {
    events,
    calendarEvents,
    loading,
    isCreatingForm,
    saveEvent,
    updateEvent,
    deleteEvent,
    refetchEvents: fetchEvents
  };
}