import { format } from "date-fns";
import { es } from "date-fns/locale";

export const ECUADOR_TZ = "America/Guayaquil";

/**
 * Convierte una fecha y hora ingresada en el formato local de Ecuador
 * a un objeto Date en UTC.
 *
 * @param dateStr Fecha en formato YYYY-MM-DD
 * @param timeStr Hora en formato HH:mm
 */
export function ecuadorToUTC(dateStr: string, timeStr: string = "00:00"): Date {
  const isoString = `${dateStr}T${timeStr}:00-05:00`;
  const date = new Date(isoString);

  if (isNaN(date.getTime())) {
    return new Date();
  }

  return date;
}

/**
 * Retorna la fecha actual en Ecuador como string literal YYYY-MM-DD.
 *
 * ✅ USAR SOLO con columnas SQL tipo DATE.
 * ❌ NO usar para TIMESTAMP / TIMESTAMPTZ.
 */
export function getTodayEcuadorDateLiteral(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ECUADOR_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Formatea una fecha UTC para mostrarla al usuario
 * en la zona horaria de Ecuador.
 */
export function formatInEcuador(
  date: Date | string | null | undefined,
  formatStr: string = "d 'de' MMMM, yyyy"
): string {
  if (!date) return "";

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ECUADOR_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const getPart = (type: string) => parts.find((p) => p.type === type)?.value;

  const shiftedDate = new Date(
    Number(getPart("year")),
    Number(getPart("month")) - 1,
    Number(getPart("day")),
    Number(getPart("hour")),
    Number(getPart("minute")),
    Number(getPart("second"))
  );

  return format(shiftedDate, formatStr, { locale: es });
}

/**
 * Formatea una fecha UTC para un input tipo date (YYYY-MM-DD)
 * en la zona horaria de Ecuador.
 */
export function formatEcuadorDateForInput(
  date: Date | string | null | undefined
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ECUADOR_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Formatea una fecha UTC para un input tipo time (HH:mm)
 * en la zona horaria de Ecuador.
 */
export function formatEcuadorTimeForInput(
  date: Date | string | null | undefined
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: ECUADOR_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

/**
 * Obtiene la fecha y hora actual en Ecuador.
 *
 * ⚠️ USAR SOLO con TIMESTAMP / TIMESTAMPTZ.
 * ❌ NO usar con columnas SQL tipo DATE.
 */
export function getNowInEcuador(): Date {
  const d = new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ECUADOR_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const getPart = (type: string) => parts.find((p) => p.type === type)?.value;

  return new Date(
    Number(getPart("year")),
    Number(getPart("month")) - 1,
    Number(getPart("day")),
    Number(getPart("hour")),
    Number(getPart("minute")),
    Number(getPart("second"))
  );
}

/**
 * Convierte un string de fecha literal YYYY-MM-DD a un objeto Date local.
 * Útil para cálculos de fechas sin interferencia de zonas horarias.
 */
export function parseLiteralDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const pureDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const [year, month, day] = pureDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Formatea un string de fecha literal YYYY-MM-DD (columna DATE)
 * sin conversiones de zona horaria.
 */
export function formatLiteralDate(
  dateStr: string | null | undefined,
  formatStr: string = "d 'de' MMMM, yyyy"
): string {
  const localDate = parseLiteralDate(dateStr);
  if (!localDate) return "";

  return format(localDate, formatStr, { locale: es });
}

/**
 * Formatea un string de tiempo literal HH:mm:ss (columna TIME)
 * a formato 24h.
 */
export function formatLiteralTime(timeStr: string | null | undefined): string {
  if (!timeStr) return "";

  const parts = timeStr.split(":");
  if (parts.length < 2) return "";

  const [hours, minutes] = parts;
  return `${hours}:${minutes}`;
}

/**
 * Formatea un rango de fechas de evento.
 */
export function formatEventDateRange(
  start: string | Date,
  end?: string | Date,
  isMultiDay?: boolean
): string {
  const startDate = typeof start === "string" ? new Date(start) : start;
  const endDate = end ? (typeof end === "string" ? new Date(end) : end) : null;

  if (isMultiDay && endDate) {
    const startParts = new Intl.DateTimeFormat("es-ES", {
      timeZone: ECUADOR_TZ,
      day: "numeric",
      month: "short",
      year: "numeric",
    }).formatToParts(startDate);

    const endParts = new Intl.DateTimeFormat("es-ES", {
      timeZone: ECUADOR_TZ,
      day: "numeric",
      month: "short",
      year: "numeric",
    }).formatToParts(endDate);

    const getPart = (parts: Intl.DateTimeFormatPart[], type: string) =>
      parts.find((p) => p.type === type)?.value;

    const startDay = getPart(startParts, "day");
    const startMonth = getPart(startParts, "month")?.replace(/\.$/, "");
    const startYear = getPart(startParts, "year");

    const endDay = getPart(endParts, "day");
    const endMonth = getPart(endParts, "month")?.replace(/\.$/, "");
    const endYear = getPart(endParts, "year");

    if (startYear === endYear && startMonth === endMonth) {
      return `${startDay}-${endDay} ${startMonth} ${startYear}`;
    } else if (startYear === endYear) {
      return `${startDay} ${startMonth}-${endDay} ${endMonth} ${endYear}`;
    } else {
      return `${startDay} ${startMonth} ${startYear}-${endDay} ${endMonth} ${endYear}`;
    }
  }

  return formatInEcuador(startDate, "d 'de' MMM, yyyy");
}

/**
 * Formatea la hora de un evento.
 */
export function formatEventTimeRange(
  start: string | Date,
  end?: string | Date,
  allDay?: boolean,
  isMultiDay?: boolean
): string {
  if (isMultiDay) return "";
  if (allDay) return "Todo el día";

  const startTime = formatInEcuador(start, "HH:mm");
  const endTime = end ? formatInEcuador(end, "HH:mm") : "";

  return endTime && endTime !== startTime
    ? `${startTime} - ${endTime}`
    : startTime;
}
