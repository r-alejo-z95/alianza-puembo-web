import { isSameDay } from "date-fns"

/**
 * Available event colors
 */
export const eventColors = {
  sky: {
    name: "Azul Cielo",
    bgForm: "bg-sky-500",
    classes: "bg-sky-200/50 hover:bg-sky-200/40 text-sky-950/80 dark:bg-sky-400/25 dark:hover:bg-sky-400/20 dark:text-sky-200 shadow-sky-700/8"
  },
  amber: {
    name: "Ámbar",
    bgForm: "bg-amber-500",
    classes: "bg-amber-200/50 hover:bg-amber-200/40 text-amber-950/80 dark:bg-amber-400/25 dark:hover:bg-amber-400/20 dark:text-amber-200 shadow-amber-700/8"
  },
  violet: {
    name: "Violeta",
    bgForm: "bg-violet-500",
    classes: "bg-violet-200/50 hover:bg-violet-200/40 text-violet-950/80 dark:bg-violet-400/25 dark:hover:bg-violet-400/20 dark:text-violet-200 shadow-violet-700/8"
  },
  rose: {
    name: "Rosa",
    bgForm: "bg-rose-500",
    classes: "bg-rose-200/50 hover:bg-rose-200/40 text-rose-950/80 dark:bg-rose-400/25 dark:hover:bg-rose-400/20 dark:text-rose-200 shadow-rose-700/8"
  },
  emerald: {
    name: "Verde Esmeralda",
    bgForm: "bg-emerald-500",
    classes: "bg-emerald-200/50 hover:bg-emerald-200/40 text-emerald-950/80 dark:bg-emerald-400/25 dark:hover:bg-emerald-400/20 dark:text-emerald-200 shadow-emerald-700/8"
  },
  orange: {
    name: "Naranja",
    bgForm: "bg-orange-500",
    classes: "bg-orange-200/50 hover:bg-orange-200/40 text-orange-950/80 dark:bg-orange-400/25 dark:hover:bg-orange-400/20 dark:text-orange-200 shadow-orange-700/8"
  },
};

/**
 * Generates the color options array for the EventForm select input.
 */
export function getEventColorOptions() {
  return Object.entries(eventColors).map(([value, { name, bgForm }]) => ({
    value,
    label: name,
    color: bgForm,
  }));
}

/**
 * Get CSS classes for event colors
 */
export function getEventColorClasses(color) {
  const colorDef = eventColors[color];
  return colorDef ? colorDef.classes : eventColors.sky.classes; // Fallback to sky
}

/**
 * Get CSS classes for border radius based on event position in multi-day events
 */
export function getBorderRadiusClasses(isFirstDay, isLastDay) {
  if (isFirstDay && isLastDay) {
    return "rounded" // Both ends rounded
  } else if (isFirstDay) {
    return "rounded-l rounded-r-none" // Only left end rounded
  } else if (isLastDay) {
    return "rounded-r rounded-l-none" // Only right end rounded
  } else {
    return "rounded-none" // No rounded corners
  }
}

/**
 * Check if an event is a multi-day event
 */
export function isMultiDayEvent(event) {
  const eventStart = new Date(event.start)
  const eventEnd = new Date(event.end)
  return event.allDay || eventStart.getDate() !== eventEnd.getDate();
}

/**
 * Filter events for a specific day
 */
export function getEventsForDay(events, day) {
  return events
    .filter((event) => {
      const eventStart = new Date(event.start)
      return isSameDay(day, eventStart);
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

/**
 * Sort events with multi-day events first, then by start time
 */
export function sortEvents(events) {
  return [...events].sort((a, b) => {
    const aIsMultiDay = isMultiDayEvent(a)
    const bIsMultiDay = isMultiDayEvent(b)

    if (aIsMultiDay && !bIsMultiDay) return -1
    if (!aIsMultiDay && bIsMultiDay) return 1

    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
}

/**
 * Get multi-day events that span across a specific day (but don't start on that day)
 */
export function getSpanningEventsForDay(events, day) {
  return events.filter((event) => {
    if (!isMultiDayEvent(event)) return false

    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)

    // Only include if it's not the start day but is either the end day or a middle day
    return (!isSameDay(day, eventStart) && (isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd)));
  });
}

/**
 * Get all events visible on a specific day (starting, ending, or spanning)
 */
export function getAllEventsForDay(events, day) {
  return events.filter((event) => {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    return (isSameDay(day, eventStart) ||
      isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd));
  });
}

/**
 * Get all events for a day (for agenda view)
 */
export function getAgendaEventsForDay(events, day) {
  return events
    .filter((event) => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      return (isSameDay(day, eventStart) ||
        isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd));
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

/**
 * Add hours to a date
 */
export function addHoursToDate(date, hours) {
  const result = new Date(date)
  result.setHours(result.getHours() + hours)
  return result
}
