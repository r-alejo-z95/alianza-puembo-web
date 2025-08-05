"use client";
import { useEffect, useMemo, useState } from "react"
import { RiCalendarCheckLine } from "@remixicon/react"
import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  isSameMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns"
import { es } from 'date-fns/locale';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"

import {
  addHoursToDate,
  AgendaDaysToShow,
  AgendaView,
  CalendarDndProvider,
  DayView,
  MonthView,
  WeekCellsHeight,
  WeekView,
  EventGap,
  EventHeight,
} from "@/components/public/calendar/event-calendar";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EventForm from '@/components/admin/forms/EventForm';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { createFormAndSheet, regenerateFormAndSheet } from '@/lib/actions';

export function IntegratedEventCalendar({
  className,
  initialView = "mes"
}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState(initialView)
  const [isEventFormOpen, setIsEventFormOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isCreatingForm, setIsCreatingForm] = useState(false);

  const supabase = createClient();

  // Fetch events from Supabase
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
      // Transform events to match calendar format
      const transformedEvents = data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start: new Date(event.start_time),
        end: event.end_time ? new Date(event.end_time) : new Date(event.start_time),
        allDay: event.all_day || false,
        color: event.color || 'sky',
        location: event.location,
        // Keep original event data for form
        originalEvent: event
      }));
      setEvents(transformedEvents);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Add keyboard shortcuts for view switching
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip if user is typing in an input, textarea or contentEditable element
      // or if the event dialog is open
      if (
        isEventFormOpen ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return
      }

      switch (e.key.toLowerCase()) {
        case "m":
          setView("mes")
          break
        case "s":
          setView("semana")
          break
        case "d":
          setView("día")
          break
        case "a":
          setView("agenda")
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    };
  }, [isEventFormOpen])

  const handlePrevious = () => {
    if (view === "mes") {
      setCurrentDate(subMonths(currentDate, 1))
    } else if (view === "semana") {
      setCurrentDate(subWeeks(currentDate, 1))
    } else if (view === "día") {
      setCurrentDate(addDays(currentDate, -1))
    } else if (view === "agenda") {
      setCurrentDate(addDays(currentDate, -AgendaDaysToShow))
    }
  }

  const handleNext = () => {
    if (view === "mes") {
      setCurrentDate(addMonths(currentDate, 1))
    } else if (view === "semana") {
      setCurrentDate(addWeeks(currentDate, 1))
    } else if (view === "día") {
      setCurrentDate(addDays(currentDate, 1))
    } else if (view === "agenda") {
      setCurrentDate(addDays(currentDate, AgendaDaysToShow))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleEventSelect = (event) => {
    console.log("Event selected:", event);
    // Use the original event data for the form
    setSelectedEvent(event.originalEvent);
    setIsEventFormOpen(true);
  }

  const handleEventCreate = (startTime) => {
    console.log("Creating new event at:", startTime);

    // Snap to 15-minute intervals
    const minutes = startTime.getMinutes()
    const remainder = minutes % 15
    if (remainder !== 0) {
      if (remainder < 7.5) {
        startTime.setMinutes(minutes - remainder)
      } else {
        startTime.setMinutes(minutes + (15 - remainder))
      }
      startTime.setSeconds(0)
      startTime.setMilliseconds(0)
    }

    // Create new event with calendar format but prepare for form
    const endTime = addHoursToDate(startTime, 1);

    setSelectedEvent({
      title: '',
      description: '',
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      all_day: false,
      color: 'sky',
      location: '',
      registration_link: '',
      create_form: false,
      regenerate_form: false
    });
    setIsEventFormOpen(true);
  }

  const handleEventSave = async (eventData, posterFile) => {
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
        return;
      } else {
        const { data: urlData } = supabase.storage.from('event-posters').getPublicUrl(uploadData.path);
        poster_url = urlData.publicUrl;
        poster_w = posterFile.width;
        poster_h = posterFile.height;
      }
    }

    // Prepare event data
    let dataToSave = {
      title: eventData.title,
      description: eventData.description || null,
      start_time: new Date(eventData.start_time).toISOString(),
      end_time: eventData.end_time ? new Date(eventData.end_time).toISOString() : null,
      poster_url,
      poster_w,
      poster_h,
      registration_link: selectedEvent?.registration_link || null,
      form_id: selectedEvent?.form_id || null,
      all_day: eventData.all_day || false,
      color: eventData.color || 'sky',
      location: eventData.location || null,
      create_form: false
    };

    let shouldCreateForm = false;

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
          toast.success(eventData.regenerate_form ? 'Formulario regenerado con éxito.' : 'Formulario de registro creado con éxito.');
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

    // Save or update event
    if (selectedEvent?.id) {
      const { error } = await supabase
        .from('events')
        .update(dataToSave)
        .eq('id', selectedEvent.id);

      if (error) {
        console.error('Error updating event:', error);
        toast.error(`Error al actualizar el evento: ${error.message || 'Error desconocido'}`);
        return;
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
        return;
      } else {
        toast.success('Evento creado con éxito.');
      }
    }

    setIsEventFormOpen(false);
    setSelectedEvent(null);
    await fetchEvents();
  };

  const handleEventUpdate = async (updatedEvent) => {
    // Handle drag and drop updates
    const eventToUpdate = updatedEvent.originalEvent;

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
    } else {
      toast.success(`Evento "${updatedEvent.title}" movido`, {
        description: format(updatedEvent.start, "MMM d, yyyy", { locale: es }),
      });
      await fetchEvents();
    }
  };

  const viewTitle = useMemo(() => {
    const formatOptions = { locale: es };

    if (view === "mes") {
      return format(currentDate, 'MMMM yyyy', formatOptions);
    } else if (view === "semana") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 })
      const end = endOfWeek(currentDate, { weekStartsOn: 0 })
      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy", formatOptions);
      } else {
        return `${format(start, "MMM", formatOptions)} - ${format(end, "MMM yyyy", formatOptions)}`;
      }
    } else if (view === "día") {
      return (
        <>
          <span className="min-[480px]:hidden" aria-hidden="true">
            {format(currentDate, "EEEE d MMM, yyyy", formatOptions)}
          </span>
          <span className="max-[479px]:hidden min-md:hidden" aria-hidden="true">
            {format(currentDate, "EEEE d MMMM, yyyy", formatOptions)}
          </span>
          <span className="max-md:hidden">
            {format(currentDate, "EEEE d MMMM, yyyy", formatOptions)}
          </span>
        </>
      );
    } else if (view === "agenda") {
      const start = currentDate
      const end = addDays(currentDate, AgendaDaysToShow - 1)

      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy", formatOptions);
      } else {
        return `${format(start, "MMM", formatOptions)} - ${format(end, "MMM yyyy", formatOptions)}`;
      }
    } else {
      return format(currentDate, "MMMM yyyy", formatOptions);
    }
  }, [currentDate, view])

  if (loading) {
    return (
      <Card className="flex items-center justify-center h-64">
        <div className="flex flex-col gap-4 justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-(--puembo-green)" />
          <p>Cargando eventos...</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        className="has-data-[slot=month-view]:flex-1"
        style={
          {
            "--event-height": `${EventHeight}px`,
            "--event-gap": `${EventGap}px`,
            "--week-cells-height": `${WeekCellsHeight}px`
          }
        }>
        <CalendarDndProvider onEventUpdate={handleEventUpdate}>
          <div className={cn("flex items-center justify-between p-2 sm:p-4", className)}>
            <div className="flex items-center gap-1 sm:gap-4">
              <Button
                variant="outline"
                className="max-[479px]:aspect-square max-[479px]:p-0!"
                onClick={handleToday}>
                <RiCalendarCheckLine className="min-[480px]:hidden" size={16} aria-hidden="true" />
                <span className="max-[479px]:sr-only">Ir a hoy</span>
              </Button>
              <div className="flex items-center sm:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  aria-label="Previous">
                  <ChevronLeftIcon size={16} aria-hidden="true" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleNext} aria-label="Next">
                  <ChevronRightIcon size={16} aria-hidden="true" />
                </Button>
              </div>
              <h2 className="text-sm font-semibold sm:text-lg md:text-xl capitalize">
                {viewTitle}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1.5 max-[479px]:h-8">
                    <span>
                      <span className="min-[480px]:hidden" aria-hidden="true">
                        {view.charAt(0).toUpperCase()}
                      </span>
                      <span className="max-[479px]:sr-only">
                        {view.charAt(0).toUpperCase() + view.slice(1)}
                      </span>
                    </span>
                    <ChevronDownIcon className="-me-1 opacity-60" size={16} aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-32">
                  <DropdownMenuItem onClick={() => setView("mes")}>
                    Mes <DropdownMenuShortcut>M</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setView("semana")}>
                    Semana <DropdownMenuShortcut>S</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setView("día")}>
                    Día <DropdownMenuShortcut>D</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setView("agenda")}>
                    Agenda <DropdownMenuShortcut>A</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-1 flex-col">
            {view === "mes" && (
              <MonthView
                currentDate={currentDate}
                events={events}
                onEventSelect={handleEventSelect}
                onEventCreate={handleEventCreate} />
            )}
            {view === "semana" && (
              <WeekView
                currentDate={currentDate}
                events={events}
                onEventSelect={handleEventSelect}
                onEventCreate={handleEventCreate} />
            )}
            {view === "día" && (
              <DayView
                currentDate={currentDate}
                events={events}
                onEventSelect={handleEventSelect}
                onEventCreate={handleEventCreate} />
            )}
            {view === "agenda" && (
              <AgendaView
                currentDate={currentDate}
                events={events}
                onEventSelect={handleEventSelect} />
            )}
          </div>
        </CalendarDndProvider>
      </Card>

      <Dialog open={isEventFormOpen} onOpenChange={setIsEventFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.id ? 'Editar Evento' : 'Crear Nuevo Evento'}</DialogTitle>
          </DialogHeader>
          {isCreatingForm && (
            <div className="flex flex-col gap-4 justify-center items-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
              <p>Creando formulario de registro... Esto puede tomar unos segundos.</p>
            </div>
          )}
          <EventForm
            event={selectedEvent}
            onSave={handleEventSave}
            onCancel={() => {
              setIsEventFormOpen(false);
              setSelectedEvent(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}