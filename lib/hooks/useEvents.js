'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { createFormAndSheet, regenerateFormAndSheet } from '@/lib/actions';

export function useEvents({ initialEvents = [] } = {}) {
  const [events, setEvents] = useState(initialEvents);
  const [archivedEvents, setArchivedEvents] = useState([]);
  const [loading, setLoading] = useState(!initialEvents.length);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [isCreatingForm, setIsCreatingForm] = useState(false);

  const supabase = createClient();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    // Traemos solo los NO archivados
    const { data, error } = await supabase
      .from('events')
      .select('*, profiles(full_name, email)')
      .eq('is_archived', false)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      // No mostramos error de toast aquí para evitar ruido si la columna no existe aún
    } else {
      setEvents(data);
    }
    setLoading(false);
  }, [supabase]);

  const fetchArchivedEvents = useCallback(async () => {
    setLoadingArchived(true);
    const { data, error } = await supabase
      .from('events')
      .select('*, profiles(full_name, email)')
      .eq('is_archived', true)
      .order('archived_at', { ascending: false });

    if (error) {
      console.error('Error fetching archived events:', error);
    } else {
      setArchivedEvents(data);
    }
    setLoadingArchived(false);
  }, [supabase]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const saveEvent = useCallback(async (eventData, posterFile, selectedEvent = null) => {
    const { data: { user } } = await supabase.auth.getUser();
    let poster_url = selectedEvent?.poster_url || null;
    let poster_w = selectedEvent?.poster_w || null;
    let poster_h = selectedEvent?.poster_h || null;

    if (eventData.remove_poster || posterFile) {
      if (selectedEvent && selectedEvent.poster_url) {
        const fileName = selectedEvent.poster_url.split('/').pop();
        const decodedFileName = decodeURIComponent(fileName);
        await supabase.storage.from('event-posters').remove([decodedFileName]);
        poster_url = null; poster_w = null; poster_h = null;
      }
    }

    if (posterFile) {
      const fileName = `${Date.now()}_${posterFile.file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('event-posters')
        .upload(fileName, posterFile.file);

      if (uploadError) {
        toast.error('Error al subir el póster.');
        return { success: false };
      } else {
        const { data: urlData } = supabase.storage.from('event-posters').getPublicUrl(uploadData.path);
        poster_url = urlData.publicUrl;
        poster_w = posterFile.width;
        poster_h = posterFile.height;
      }
    }

    let dataToSave = {
      title: eventData.title,
      description: eventData.description || null,
      start_time: eventData.start_time,
      end_time: eventData.end_time,
      poster_url, poster_w, poster_h,
      registration_link: eventData.registration_link || null,
      form_id: eventData.form_id || null,
      all_day: eventData.all_day || false,
      is_multi_day: eventData.is_multi_day || false,
      is_recurring: eventData.is_recurring || false,
      recurrence_pattern: eventData.is_recurring ? eventData.recurrence_pattern : null,
      color: eventData.color || 'sky',
      location: eventData.location || null,
      is_archived: false // Aseguramos que al guardar esté activo
    };

    let createdFormSlug = null;

    if (eventData.create_form) {
      setIsCreatingForm(true);
      const result = await createFormAndSheet(eventData.title);
      if (result.success) {
        dataToSave.registration_link = result.formUrl;
        dataToSave.form_id = result.formId;
        createdFormSlug = result.formSlug;
      }
      setIsCreatingForm(false);
    }

    if (selectedEvent?.id) {
      const { error } = await supabase.from('events').update(dataToSave).eq('id', selectedEvent.id);
      if (error) { toast.error('Error al actualizar'); return { success: false }; }
    } else {
      const { error } = await supabase.from('events').insert([{ ...dataToSave, user_id: user?.id }]);
      if (error) { toast.error('Error al crear'); return { success: false }; }
    }

    await fetchEvents();
    return { success: true, formId: dataToSave.form_id, formSlug: createdFormSlug };
  }, [supabase, fetchEvents]);

  const archiveEvent = useCallback(async (eventId) => {
    const previousEvents = [...events];
    setEvents(current => current.filter(e => e.id !== eventId));

    try {
      const { error } = await supabase
        .from('events')
        .update({ is_archived: true, archived_at: new Date().toISOString() })
        .eq('id', eventId);
      if (error) throw error;
      toast.success('Evento movido a la papelera');
      return true;
    } catch (err) {
      setEvents(previousEvents);
      toast.error('Error al archivar');
      return false;
    }
  }, [supabase, events]);

  const restoreEvent = useCallback(async (eventId) => {
    const previousArchived = [...archivedEvents];
    setArchivedEvents(current => current.filter(e => e.id !== eventId));

    try {
      const { error } = await supabase
        .from('events')
        .update({ is_archived: false, archived_at: null })
        .eq('id', eventId);
      if (error) throw error;
      toast.success('Evento restaurado');
      fetchEvents();
      return true;
    } catch (err) {
      setArchivedEvents(previousArchived);
      toast.error('Error al restaurar');
      return false;
    }
  }, [supabase, archivedEvents, fetchEvents]);

  const permanentlyDeleteEvent = useCallback(async (eventId) => {
    const previousArchived = [...archivedEvents];
    setArchivedEvents(current => current.filter(e => e.id !== eventId));

    try {
      // 1. Obtener poster para borrar de storage
      const { data: event } = await supabase.from('events').select('poster_url').eq('id', eventId).single();
      if (event?.poster_url) {
        const fileName = event.poster_url.split('/').pop();
        await supabase.storage.from('event-posters').remove([decodeURIComponent(fileName)]);
      }

      // 2. Borrar de la DB
      const { error } = await supabase.from('events').delete().eq('id', eventId);
      if (error) throw error;

      toast.success('Evento eliminado definitivamente');
      return true;
    } catch (err) {
      setArchivedEvents(previousArchived);
      toast.error('Error al eliminar definitivamente');
      return false;
    }
  }, [supabase, archivedEvents]);

  // Transform events for calendar format
  const calendarEvents = events.flatMap(event => {
    const baseEvent = {
      id: event.id, title: event.title, description: event.description,
      allDay: event.all_day || false, is_multi_day: event.is_multi_day || false,
      color: event.color || 'sky', location: event.location, originalEvent: event
    };

    if (!event.is_recurring || !event.recurrence_pattern) {
      return [{ ...baseEvent, start: new Date(event.start_time), end: event.end_time ? new Date(event.end_time) : new Date(event.start_time) }];
    }

    const instances = [];
    const startDate = new Date(event.start_time);
    const durationMs = event.end_time ? (new Date(event.end_time).getTime() - startDate.getTime()) : 0;
    const limitDate = new Date(); limitDate.setMonth(limitDate.getMonth() + 6);
    let currentStart = new Date(startDate);

    while (currentStart <= limitDate) {
      instances.push({ ...baseEvent, id: `${event.id}-${currentStart.getTime()}`, start: new Date(currentStart), end: new Date(currentStart.getTime() + durationMs) });
      if (event.recurrence_pattern === 'weekly') currentStart.setUTCDate(currentStart.getUTCDate() + 7);
      else if (event.recurrence_pattern === 'biweekly') currentStart.setUTCDate(currentStart.getUTCDate() + 14);
      else if (event.recurrence_pattern === 'monthly') currentStart.setUTCMonth(currentStart.getUTCMonth() + 1);
      else if (event.recurrence_pattern === 'yearly') currentStart.setUTCFullYear(currentStart.getUTCFullYear() + 1);
      else break;
    }
    return instances;
  });

  return {
    events, archivedEvents, calendarEvents, loading, loadingArchived, isCreatingForm,
    saveEvent, archiveEvent, restoreEvent, permanentlyDeleteEvent, 
    fetchArchivedEvents, refetchEvents: fetchEvents
  };
}
