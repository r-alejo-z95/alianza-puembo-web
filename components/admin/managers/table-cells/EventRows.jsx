import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { TableRow, TableCell } from '@/components/ui/table';
import { OverflowCell } from './OverflowCell';
import { toast } from 'sonner';
import { Edit, Trash2, Link as LinkIcon, Copy, MapPin } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getEventColorClasses } from '@/components/public/calendar/event-calendar/utils';

const formatEventDate = (start, end, isMultiDay) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;

    const options = { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' };
    const esFormatter = new Intl.DateTimeFormat('es-ES', options);

    if (isMultiDay && endDate) {
        // For multi-day events, show date range
        const startFormatted = esFormatter.format(startDate).replace(/\.$/, '');
        const endFormatted = esFormatter.format(endDate).replace(/\.$/, '');
        return `${startFormatted} - ${endFormatted}`;
    } else {
        // For single-day events (all-day or timed), show just the start date
        return esFormatter.format(startDate).replace(/\.$/, '');
    }
};

const formatEventTime = (event) => {
    if (event.is_multi_day) {
        return 'Varios días';
    }

    if (event.all_day) {
        return 'Todo el día';
    }

    // For timed events, show time range in local timezone
    const startTime = new Date(event.start_time).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Guayaquil'
    });

    const endTime = event.end_time ? new Date(event.end_time).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Guayaquil'
    }) : '';

    return endTime ? `${startTime} - ${endTime}` : startTime;
};

export function EventRow({ event, onEdit, onDelete, compact }) {
    const posterActions = event.poster_url ? (
        <div className="flex items-center gap-1">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                            <a href={event.poster_url} target="_blank" rel="noopener noreferrer" aria-label="Ver póster">
                                <LinkIcon className="w-4 h-4" />
                            </a>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ver póster</TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost" size="icon"
                            onClick={() => {
                                navigator.clipboard.writeText(event.poster_url);
                                toast.success('URL del póster copiado al portapapeles.');
                            }}
                            aria-label="Copiar URL del póster"
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copiar URL del póster</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    ) : "-";

    const registrationLinkActions = event.registration_link ? (
        <div className="flex items-center gap-1">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                            <a href={event.registration_link} target="_blank" rel="noopener noreferrer" aria-label="Ir al enlace de registro">
                                <LinkIcon className="w-4 h-4" />
                            </a>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ir al enlace de registro</TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost" size="icon"
                            onClick={() => {
                                navigator.clipboard.writeText(event.registration_link);
                                toast.success('URL de registro copiada al portapapeles.');
                            }}
                            aria-label="Copiar URL de registro"
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copiar URL de registro</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    ) : "-";

    const colorDisplay = event.color ? (
        <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${getEventColorClasses(event.color)}`} />
            <span className="text-sm capitalize">{event.color}</span>
        </div>
    ) : "-";

    const locationDisplay = event.location ? (
        <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{event.location}</span>
        </div>
    ) : "-";

    const actions = (
        <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" aria-label="Editar evento" onClick={onEdit}>
                <Edit className="w-4 h-4" />
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" aria-label="Eliminar evento">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el evento de nuestros servidores.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete}>Continuar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );

    const formattedDate = formatEventDate(event.start_time, event.end_time, event.is_multi_day);
    const formattedTime = formatEventTime(event);

    if (compact) {
        return (
            <div className='border rounded-lg p-4 shadow-sm space-y-2'>
                <div className="flex items-center gap-2">
                    {event.color && <div className={`w-3 h-3 rounded-full ${getEventColorClasses(event.color)}`} />}
                    {event.title}
                </div>
                <div><span className="font-semibold">Descripción:</span> {event.description}</div>
                <div><span className="font-semibold">Fecha:</span> {formattedDate}</div>
                <div><span className="font-semibold">Hora:</span> {formattedTime}</div>
                {event.location && <div><span className="font-semibold">Ubicación:</span> {locationDisplay}</div>}
                {event.poster_url && <div><span className="font-semibold">Póster:</span> {posterActions}</div>}
                {event.registration_link && <div><span className="font-semibold">Link de Registro:</span> {registrationLinkActions}</div>}
                <div className="flex gap-2 pt-2">{actions}</div>
            </div>
        );
    }

    return (
        <TableRow>
            <TableCell className="max-w-36 overflow-hidden text-ellipsis whitespace-nowrap">
                <div className="flex items-center gap-2">
                    {event.color && <div className={`w-3 h-3 rounded-full ${getEventColorClasses(event.color)}`} />}
                    <OverflowCell>{event.title}</OverflowCell>
                </div>
            </TableCell>
            <TableCell className="max-w-68 overflow-hidden text-ellipsis whitespace-nowrap">
                <OverflowCell>{event.description}</OverflowCell>
            </TableCell>
            <TableCell>
                <OverflowCell>{formattedDate}</OverflowCell>
            </TableCell>
            <TableCell>{formattedTime}</TableCell>
            <TableCell>{posterActions}</TableCell>
            <TableCell className="max-w-32 overflow-hidden text-ellipsis whitespace-nowrap">
                <OverflowCell>{colorDisplay}</OverflowCell>
            </TableCell>
            <TableCell className="max-w-40 overflow-hidden text-ellipsis whitespace-nowrap">
                <OverflowCell>{locationDisplay}</OverflowCell>
            </TableCell>
            <TableCell>{registrationLinkActions}</TableCell>
            <TableCell className="min-w-[150px]">{actions}</TableCell>
        </TableRow>
    );
}