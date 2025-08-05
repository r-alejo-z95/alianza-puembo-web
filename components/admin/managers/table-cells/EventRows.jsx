import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { OverflowCell } from './OverflowCell';
import { toast } from 'sonner';
import { Edit, Trash2, Link as LinkIcon, Copy, MapPin } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const colorMap = {
    sky: 'bg-sky-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    orange: 'bg-orange-500',
    rose: 'bg-rose-500',
    violet: 'bg-violet-500',
    indigo: 'bg-indigo-500',
    teal: 'bg-teal-500',
};

const formatEventDate = (start, end) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;

    const options = { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Guayaquil' };
    const esFormatter = new Intl.DateTimeFormat('es-ES', options);

    const isSameDay = (d1, d2) => {
        if (!d1 || !d2) return false;
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    if (!endDate || isSameDay(startDate, endDate)) {
        return esFormatter.format(startDate).replace(/\.$/, '');
    } else {
        const startDay = startDate.getDate();
        const endParts = esFormatter.format(endDate).replace(/\.$/, '').split(' ');
        return `${startDay} - ${endParts[0]} ${endParts[1]} ${endParts[2]}`;
    }
};

const formatEventTime = (event) => {
    if (event.all_day) {
        return 'Todo el día';
    }

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
            <div className={`w-4 h-4 rounded-full ${colorMap[event.color] || 'bg-gray-400'}`} />
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

    const formattedDate = formatEventDate(event.start_time, event.end_time);
    const formattedTime = formatEventTime(event);

    if (compact) {
        return (
            <div className='border rounded-lg p-4 shadow-sm space-y-2'>
                <div className="flex items-center gap-2">
                    <span className="font-semibold">Título:</span>
                    {event.color && <div className={`w-3 h-3 rounded-full ${colorMap[event.color] || 'bg-gray-400'}`} />}
                    {event.title}
                    {event.all_day && <Badge variant="secondary" className="text-xs">Todo el día</Badge>}
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
                    {event.color && <div className={`w-3 h-3 rounded-full ${colorMap[event.color] || 'bg-gray-400'}`} />}
                    <OverflowCell>{event.title}</OverflowCell>
                    {event.all_day && <Badge variant="secondary" className="text-xs">Todo el día</Badge>}
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