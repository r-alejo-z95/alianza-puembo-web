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
        eventColor="#3788d8"
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
                  <div className="fc-event-main-frame">
                    <div className="fc-event-time">{arg.timeText}</div>
                    <div className="fc-event-title-container">
                      <div className="fc-event-title fc-sticky">{arg.event.title}</div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-white p-4 rounded-lg shadow-lg max-w-xs text-sm">
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
    </div>
  );
}