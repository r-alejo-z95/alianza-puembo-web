import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const ECUADOR_TZ = 'America/Guayaquil';

/**
 * Convierte una fecha y hora ingresada en el formato local de Ecuador a un objeto Date en UTC.
 * Ecuador se encuentra en UTC-5 y no tiene horario de verano.
 * 
 * @param dateStr Fecha en formato YYYY-MM-DD
 * @param timeStr Hora en formato HH:mm
 * @returns Objeto Date en UTC
 */
export function ecuadorToUTC(dateStr: string, timeStr: string = '00:00'): Date {
  // Construimos una cadena ISO con el offset de Ecuador (-05:00)
  const isoString = `${dateStr}T${timeStr}:00-05:00`;
  const date = new Date(isoString);
  
  // Si la fecha es inválida (por ejemplo, strings vacíos), retornamos la fecha actual o manejamos el error
  if (isNaN(date.getTime())) {
    return new Date();
  }
  
  return date;
}

/**
 * Formatea una fecha UTC para mostrarla al usuario en la zona horaria de Ecuador.
 * 
 * @param date Objeto Date o cadena de fecha en UTC
 * @param formatStr Cadena de formato de date-fns
 * @returns Cadena formateada
 */
export function formatInEcuador(date: Date | string | null | undefined, formatStr: string = "d 'de' MMMM, yyyy"): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  // Obtenemos la fecha/hora en Ecuador como una cadena que parece "local"
  // formatToParts es más seguro para reconstruir un objeto fecha "desplazado"
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ECUADOR_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(d);

  const getPart = (type: string) => parts.find(p => p.type === type)?.value;
  
  // Reconstruimos la fecha como si fuera local para que date-fns la formatee correctamente
  const shiftedDate = new Date(
    Number(getPart('year')),
    Number(getPart('month')) - 1,
    Number(getPart('day')),
    Number(getPart('hour')),
    Number(getPart('minute')),
    Number(getPart('second'))
  );

  return format(shiftedDate, formatStr, { locale: es });
}

/**
 * Formatea una fecha UTC para un input de tipo 'date' (YYYY-MM-DD) en la zona horaria de Ecuador.
 */
export function formatEcuadorDateForInput(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ECUADOR_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);
}

/**
 * Formatea una fecha UTC para un input de tipo 'time' (HH:mm) en la zona horaria de Ecuador.
 */
export function formatEcuadorTimeForInput(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: ECUADOR_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(d);
}

/**
 * Obtiene la fecha y hora actual en Ecuador.
 */
export function getNowInEcuador(): Date {
  const d = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ECUADOR_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(d);

  const getPart = (type: string) => parts.find(p => p.type === type)?.value;
  
  return new Date(
    Number(getPart('year')),
    Number(getPart('month')) - 1,
    Number(getPart('day')),
    Number(getPart('hour')),
    Number(getPart('minute')),
    Number(getPart('second'))
  );
}

/**
 * Formatea un rango de fechas de evento para el panel de administración.
 */
export function formatEventDateRange(start: string | Date, end?: string | Date, isMultiDay?: boolean): string {
    const startDate = typeof start === 'string' ? new Date(start) : start;
    const endDate = end ? (typeof end === 'string' ? new Date(end) : end) : null;

    if (isMultiDay && endDate) {
        // Obtenemos los componentes en la zona horaria de Ecuador
        const startParts = new Intl.DateTimeFormat('es-ES', { 
            timeZone: ECUADOR_TZ, day: 'numeric', month: 'short', year: 'numeric' 
        }).formatToParts(startDate);
        
        const endParts = new Intl.DateTimeFormat('es-ES', { 
            timeZone: ECUADOR_TZ, day: 'numeric', month: 'short', year: 'numeric' 
        }).formatToParts(endDate);

        const getPart = (parts: Intl.DateTimeFormatPart[], type: string) => parts.find(p => p.type === type)?.value;

        const startDay = getPart(startParts, 'day');
        const startMonth = getPart(startParts, 'month').replace(/\.$/, '');
        const startYear = getPart(startParts, 'year');
        
        const endDay = getPart(endParts, 'day');
        const endMonth = getPart(endParts, 'month').replace(/\.$/, '');
        const endYear = getPart(endParts, 'year');

        if (startYear === endYear && startMonth === endMonth) {
            return `${startDay}-${endDay} ${startMonth} ${startYear}`;
        } else if (startYear === endYear) {
            return `${startDay} ${startMonth}-${endDay} ${endMonth} ${endYear}`;
        } else {
            return `${startDay} ${startMonth} ${startYear}-${endDay} ${endMonth} ${endYear}`;
        }
    } else {
        return formatInEcuador(startDate, "d 'de' MMM, yyyy");
    }
}

/**
 * Formatea la hora de un evento para el panel de administración.
 */
export function formatEventTimeRange(start: string | Date, end?: string | Date, allDay?: boolean, isMultiDay?: boolean): string {
    if (isMultiDay) return '';
    if (allDay) return 'Todo el día';

    const startTime = formatInEcuador(start, 'HH:mm');
    const endTime = end ? formatInEcuador(end, 'HH:mm') : '';

    return endTime && endTime !== startTime ? `${startTime} - ${endTime}` : startTime;
}
