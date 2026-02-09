'use client';

import dynamic from 'next/dynamic';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false });

export default function UserCalendar({ events }) {
  return (
    <div className="w-full lg:w-[75vw] mx-auto">
      <FullCalendar
        height="auto"
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'title',
          center: '',
          right: 'prev next',
        }}
        titleFormat={{
          month: 'long',
          year: 'numeric',
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
          const startTime = new Date(arg.event.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Guayaquil' });
          const eventLink = '/eventos/proximos-eventos#' + encodeURIComponent(arg.event.title);


          const content = (
            <>
              <p className="font-bold text-base mb-1 text-black">{arg.event.title}</p>
              {arg.event.extendedProps.description && (
                <p className="text-gray-500 mb-2">{arg.event.extendedProps.description}</p>
              )}
              <p className="text-gray-600">{startTime}</p>
            </>
          );

          return (
            <Popover>
              <PopoverTrigger asChild className="block cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap">
                {/* Renderiza el contenido predeterminado del evento de FullCalendar */}
                <div className="fc-event-main-frame overflow-hidden">
                  <div className="fc-event-title-container flex flex-row items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-(--puembo-green)" />
                    <div className="fc-event-title fc-sticky text-ellipsis">{arg.event.title}</div>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent side="top-start" className="bg-gray-100/90 border-white min-w-[100px] max-w-3xs break-words text-xs">
                <Link href={eventLink} target="_blank" rel="noopener noreferrer" className='cursor-pointer'>
                  {content}
                </Link>
              </PopoverContent>
            </Popover>
          );
        }}
      />
      <style jsx global>{`
        .fc .fc-button-primary {
          background-color: hsl(92, 45.9%, 47.8%); /* puembo-green */
          border-style: none;
          color: white;
          box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
          border-radius:0px;
          padding-left: 13px;
          padding-right: 13px;
        }
        .fc .fc-button-primary:hover {
          background-color: hsl(92, 45.9%, 37.8%); /* Darker puembo-green */
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active {
          background-color: hsl(92, 45.9%, 37.8%); /* Darker puembo-green for active state */
        }
        .fc .fc-button .fc-icon {
          font-size: 1em;
          vertical-align: middle;
        }
        .fc:active .fc-button-primary:active {
          outline: none;
          border-style: none;
          background-color: hsl(92, 45.9%, 47.8%);
          }
        .fc:focus .fc-button-primary:focus {
          outline: none;
          border-style: none;
          background-color: hsl(92, 45.9%, 47.8%);
          }
      `}</style>
    </div>
  );
}