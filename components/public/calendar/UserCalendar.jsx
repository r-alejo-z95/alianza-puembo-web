'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function UserCalendar({ events }) {
  return (
    <div className="w-full">
      <FullCalendar
        height="85vh"
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        initialView="dayGridMonth"
        events={events}
        editable={false} // Los usuarios no pueden editar eventos
        selectable={false} // Los usuarios no pueden seleccionar fechas para agregar eventos
        locale={esLocale} // Poner el calendario en español
        eventColor="var(--puembo-green)"
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short'
        }}
        eventContent={(arg) => {
          const startTime = new Date(arg.event.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* Renderiza el contenido predeterminado del evento de FullCalendar */}
                  <div className="fc-event-main-frame overflow-hidden">
                    <div className="fc-event-title-container flex flex-row items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-(--puembo-green)"/> 
                      <div className="fc-event-title fc-sticky text-ellipsis">{arg.event.title}</div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-white/50 backdrop-blur-xs p-4 pr-0 rounded-lg shadow-lg max-w-xs text-sm">
                  <p className="font-bold text-base mb-1 text-black">{arg.event.title}</p>
                  {arg.event.extendedProps.description && (
                    <p className="text-gray-700 mb-2">{arg.event.extendedProps.description}</p>
                  )}
                  <p className="text-gray-600">{startTime}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }}
      />
      <style jsx global>{`
        .fc .fc-button-primary {
          background-color: hsl(92, 45.9%, 47.8%); /* puembo-green */
          border-color: hsl(92, 45.9%, 47.8%);
          color: white;
        }
        .fc .fc-button-primary:hover {
          background-color: hsl(92, 45.9%, 37.8%); /* Darker puembo-green */
          border-color: hsl(92, 45.9%, 37.8%);
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active {
          background-color: hsl(92, 45.9%, 37.8%); /* Darker puembo-green for active state */
          border-color: hsl(92, 45.9%, 37.8%);
        }
      `}</style>
    </div>
  );
}