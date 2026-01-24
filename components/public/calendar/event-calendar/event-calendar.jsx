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
import { useRouter } from 'next/navigation';
import { Loader2 } from "lucide-react";
import { AdminEditorPanel } from "@/components/admin/layout/AdminEditorPanel";

export function IntegratedEventCalendar({
  className,
  initialView = "mes",
  isAdmin = false,
  calendarEvents,
  loading,
  isCreatingForm,
  saveEvent,
  updateEvent
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState(initialView)
  const [isEventFormOpen, setIsEventFormOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  const router = useRouter();

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
    if (!isAdmin) return; // Only allow editing in admin mode

    console.log("Event selected:", event);
    setSelectedEvent(event.originalEvent);
    setIsEventFormOpen(true);
  }

  const handleEventCreate = (startTime) => {
    if (!isAdmin) return; // Only allow creating in admin mode

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
    const result = await saveEvent(eventData, posterFile, selectedEvent);

    if (result.success) {
      setIsEventFormOpen(false);
      setSelectedEvent(null);

      // Navigate to form editor if a form was created
      if (result.formId && (eventData.create_form || eventData.regenerate_form)) {
        router.push(`/admin/formularios?editFormId=${result.formId}`);
      }
    }
  };

  const handleEventUpdate = async (updatedEvent) => {
    await updateEvent(updatedEvent);
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
        <Loader2 className="h-10 w-10 animate-spin text-[var(--puembo-green)]" />
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
        <CalendarDndProvider onEventUpdate={isAdmin ? handleEventUpdate : undefined}>
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
                  variant="green"
                  size="icon"
                  onClick={handlePrevious}
                  aria-label="Previous">
                  <ChevronLeftIcon size={16} aria-hidden="true" />
                </Button>
                <Button variant="green" size="icon" onClick={handleNext} aria-label="Next">
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
                events={calendarEvents}
                onEventSelect={handleEventSelect}
                onEventCreate={isAdmin ? handleEventCreate : undefined}
                isAdmin={isAdmin} />
            )}
            {view === "semana" && (
              <WeekView
                currentDate={currentDate}
                events={calendarEvents}
                onEventSelect={handleEventSelect}
                onEventCreate={isAdmin ? handleEventCreate : undefined}
                isAdmin={isAdmin} />
            )}
            {view === "día" && (
              <DayView
                currentDate={currentDate}
                events={calendarEvents}
                onEventSelect={handleEventSelect}
                onEventCreate={isAdmin ? handleEventCreate : undefined}
                isAdmin={isAdmin} />
            )}
            {view === "agenda" && (
              <AgendaView
                currentDate={currentDate}
                events={calendarEvents}
                onEventSelect={handleEventSelect} />
            )}
          </div>
        </CalendarDndProvider>
      </Card>

      {isAdmin && (
        <AdminEditorPanel
          open={isEventFormOpen}
          onOpenChange={setIsEventFormOpen}
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
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">Sincronizando Formulario</p>
              </div>
            )}
            <div className="md:p-12">
              <EventForm
                event={selectedEvent}
                onSave={handleEventSave}
                onCancel={() => {
                  setIsEventFormOpen(false);
                  setSelectedEvent(null);
                }}
              />
            </div>
          </div>
        </AdminEditorPanel>
      )}
    </>
  );
}