import { isSameDay } from "date-fns"

/**
 * Available event colors
 */
export const eventColors = {
  sky: { name: "Azul Cielo", bg: "bg-sky-500" },
  amber: { name: "Ámbar", bg: "bg-amber-500" },
  violet: { name: "Violeta", bg: "bg-violet-500" },
  rose: { name: "Rosa", bg: "bg-rose-500" },
  emerald: { name: "Verde Esmeralda", bg: "bg-emerald-500" },
  orange: { name: "Naranja", bg: "bg-orange-500" },
};

/**
 * Generates the color options array for the EventForm select input.
 */
export function getEventColorOptions() {
  return Object.entries(eventColors).map(([value, { name, bg }]) => ({
    value,
    label: name,
    color: bg,
  }));
}

/**
 * Get CSS classes for event colors
 */
export function getEventColorClasses(i) {
  const colorName = eventColors[i] ? i : "sky"; // Fallback to sky
  return `bg-${colorName}-200/50 hover:bg-${colorName}-200/40 text-${colorName}-950/80 dark:bg-${colorName}-400/25 dark:hover:bg-${colorName}-400/20 dark:text-${colorName}-200 shadow-${colorName}-700/8`;
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
