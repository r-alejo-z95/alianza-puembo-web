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
        eventDidMount={(info) => {
          // Añade un tooltip con el título completo del evento
          info.el.title = info.event.title;
        }}
      />
    </div>
  );
}
