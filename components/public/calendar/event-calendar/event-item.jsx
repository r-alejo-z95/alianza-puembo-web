"use client";
import { useMemo } from "react"
import { differenceInMinutes, isPast } from "date-fns"

import { getBorderRadiusClasses, getEventColorClasses } from "@/components/public/calendar/event-calendar";
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Link from 'next/link'
import { formatInEcuador } from "@/lib/date-utils";

// Helper to format time as "ha" or "h:mma" in Ecuador timezone
const formatTimeWithOptionalMinutes = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const minutes = d.getUTCMinutes(); // This might be wrong if we don't handle TZ. 
  // Better use formatInEcuador with a logic that hides :00
  const timeStr = formatInEcuador(d, 'h:mm a').toLowerCase();
  return timeStr.replace(':00', '');
}

// Shared wrapper component for event styling
function EventWrapper({
  event,
  isFirstDay = true,
  isLastDay = true,
  isDragging,
  onClick,
  className,
  children,
  currentTime,
  dndListeners,
  dndAttributes,
  onMouseDown,
  onTouchStart,
  isAdmin,
  displayStart
}) {
  // Always use the currentTime (if provided) to determine if the event is in the past
  const displayEnd = currentTime
    ? new Date(new Date(currentTime).getTime() +
      (new Date(event.end).getTime() - new Date(event.start).getTime()))
    : new Date(event.end)

  const isEventInPast = isPast(displayEnd)

  const getPopoverEventTime = () => {
    if (event.is_multi_day) return null;
    if (event.allDay) return "Todo el día";
    return formatTimeWithOptionalMinutes(displayStart);
  };

  return (
    <>
      {isAdmin ? (
        <button
          className={cn(
            "cursor-pointer focus-visible:border-ring focus-visible:ring-ring/50 flex size-full overflow-hidden px-1 text-left font-medium backdrop-blur-md transition outline-none select-none focus-visible:ring-[3px] data-dragging:cursor-grabbing data-dragging:shadow-lg data-past-event:line-through sm:px-2",
            getEventColorClasses(event.color),
            getBorderRadiusClasses(isFirstDay, isLastDay),
            className
          )}
          data-dragging={isDragging || undefined}
          data-past-event={isEventInPast || undefined}
          onClick={onClick}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          {...dndListeners}
          {...dndAttributes}>
          {children}
        </button>
      ) : (
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "cursor-pointer focus-visible:border-ring focus-visible:ring-ring/50 flex size-full overflow-hidden px-1 text-left font-medium backdrop-blur-md transition outline-none select-none focus-visible:ring-[3px] data-past-event:line-through sm:px-2",
                getEventColorClasses(event.color),
                getBorderRadiusClasses(isFirstDay, isLastDay),
                className
              )}
              data-past-event={isEventInPast || undefined}
              onClick={onClick}
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
              {...dndListeners}
              {...dndAttributes}>
              {children}
            </button>
          </PopoverTrigger>
          <PopoverContent side="top-start" className="bg-gray-100/90 backdrop-blur-xs border-white min-w-[100px] max-w-3xs break-words text-xs">
            <Link href={`/eventos/proximos-eventos?page=${event.page}#` + encodeURIComponent(event.title)} target="_blank" rel="noopener noreferrer" className='cursor-pointer'>
              <p className="font-bold text-base mb-1 text-black">{event.title}</p>
              {event.description && (
                <p className="text-gray-500 mb-2">{event.description}</p>
              )}
              <p className="text-gray-600">{getPopoverEventTime()}</p>
            </Link>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}

export function EventItem({
  event,
  view,
  isDragging,
  onClick,
  showTime,
  currentTime,
  isFirstDay = true,
  isLastDay = true,
  children,
  className,
  dndListeners,
  dndAttributes,
  onMouseDown,
  onTouchStart,
  isAdmin
}) {
  const eventColor = event.color

  // Use the provided currentTime (for dragging) or the event's actual time
  const displayStart = useMemo(() => {
    return currentTime || new Date(event.start);
  }, [currentTime, event.start])

  const displayEnd = useMemo(() => {
    return currentTime
      ? new Date(new Date(currentTime).getTime() +
        (new Date(event.end).getTime() - new Date(event.start).getTime()))
      : new Date(event.end);
  }, [currentTime, event.start, event.end])

  // Calculate event duration in minutes
  const durationMinutes = useMemo(() => {
    return differenceInMinutes(displayEnd, displayStart);
  }, [displayStart, displayEnd])

  const getEventTime = () => {
    if (event.is_multi_day) return "Varios días"
    if (event.allDay) return "Todo el día"

    // For short events (less than 45 minutes), only show start time
    if (durationMinutes < 45) {
      return formatTimeWithOptionalMinutes(displayStart);
    }

    // For longer events, show both start and end time
    return `${formatTimeWithOptionalMinutes(displayStart)} - ${formatTimeWithOptionalMinutes(displayEnd)}`;
  }

  if (view === "month") {
    return (
      <EventWrapper
        event={event}
        isAdmin={isAdmin}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        isDragging={isDragging}
        onClick={onClick}
        className={cn(
          "mt-[var(--event-gap)] h-[var(--event-height)] items-center text-[10px] sm:text-xs",
          className
        )}
        currentTime={currentTime}
        dndListeners={dndListeners}
        dndAttributes={dndAttributes}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        displayStart={displayStart}>
        {children || (
          <span className="truncate">
            {!event.allDay && !event.is_multi_day && (
              <span className="truncate font-normal opacity-70 sm:text-[11px]">
                {formatTimeWithOptionalMinutes(displayStart)}{" "}
              </span>
            )}
            {event.title}
          </span>
        )}
      </EventWrapper>
    );
  }

  if (view === "week" || view === "day") {
    return (
      <EventWrapper
        event={event}
        isAdmin={isAdmin}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        isDragging={isDragging}
        onClick={onClick}
        className={cn(
          "py-1",
          durationMinutes < 45 ? "items-center" : "flex-col",
          view === "week" ? "text-[10px] sm:text-xs" : "text-xs",
          className
        )}
        currentTime={currentTime}
        dndListeners={dndListeners}
        dndAttributes={dndAttributes}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        displayStart={displayStart}>
        {durationMinutes < 45 ? (
          <div className="truncate">
            {event.title}{" "}
            {showTime && !event.allDay && !event.is_multi_day && (
              <span className="opacity-70">
                {formatTimeWithOptionalMinutes(displayStart)}
              </span>
            )}
          </div>
        ) : (
          <>
            <div className="truncate font-medium">{event.title}</div>
            {showTime && (
              <div className="truncate font-normal opacity-70 sm:text-[11px]">
                {getEventTime()}
              </div>
            )}
          </>
        )}
      </EventWrapper>
    );
  }

  // Agenda view - kept separate since it's significantly different
  return (
    <button
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 flex w-full flex-col gap-1 rounded p-2 text-left transition outline-none focus-visible:ring-[3px] data-past-event:line-through data-past-event:opacity-90",
        getEventColorClasses(eventColor),
        className
      )}
      data-past-event={isPast(new Date(event.end || event.start)) || undefined}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      {...dndListeners}
      {...dndAttributes}>
      <div className="text-sm font-medium">{event.title}</div>
      <div className="text-xs opacity-70">
        {event.is_multi_day ? (
          null
        ) : event.allDay ? (
          <span>Todo el día</span>
        ) : (
          <span className="uppercase">
            {formatTimeWithOptionalMinutes(displayStart)} -{" "}
            {formatTimeWithOptionalMinutes(displayEnd)}
          </span>
        )}
        {event.location && (
          <>
            <span className="px-1 opacity-35"> · </span>
            <span>{event.location}</span>
          </>
        )}
      </div>
      {event.description && (
        <div className="my-1 text-xs opacity-90">{event.description}</div>
      )}
    </button>
  );
}