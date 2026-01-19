import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { TableRow, TableCell } from '@/components/ui/table';
import { OverflowCell } from './OverflowCell';
import { toast } from 'sonner';
import { Edit, Trash2, Link as LinkIcon, Copy, MapPin } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getEventColorClasses } from '@/components/public/calendar/event-calendar/utils';
import { formatEventDateRange, formatEventTimeRange } from '@/lib/date-utils';
import { AuthorAvatar } from '@/components/shared/AuthorAvatar';

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

    const formattedDate = formatEventDateRange(event.start_time, event.end_time, event.is_multi_day);
    const formattedTime = formatEventTimeRange(event.start_time, event.end_time, event.all_day, event.is_multi_day);

    if (compact) {
        return (
            <div className='border rounded-lg p-4 shadow-sm space-y-2 relative'>
                <div className="absolute top-4 right-4">
                    <AuthorAvatar profile={event.profiles} className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2">
                    {event.color && <div className={`w-3 h-3 rounded-full ${getEventColorClasses(event.color)}`} />}
                    {event.title}
                </div>
                {event.description && <div><span className="font-semibold">Descripción:</span> {event.description}</div>}
                <div><span className="font-semibold">Fecha:</span> {formattedDate}</div>
                {formattedTime && <div><span className="font-semibold">Hora:</span> {formattedTime}</div>}
                {event.location && <div><span className="font-semibold">Ubicación:</span> {locationDisplay}</div>}
                {event.poster_url && <div><span className="font-semibold">Póster:</span> {posterActions}</div>}
                {event.registration_link && <div><span className="font-semibold">Link de Registro:</span> {registrationLinkActions}</div>}
                <div className="flex gap-2 pt-2">{actions}</div>
            </div>
        );
    }

    return (
        <TableRow>
            <TableCell className="max-w-36">
                <div className="flex items-center gap-2 overflow-hidden">
                    {event.color && <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getEventColorClasses(event.color)}`} />}
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                        <OverflowCell>{event.title}</OverflowCell>
                    </div>
                </div>
            </TableCell>
            <TableCell className="max-w-68 overflow-hidden text-ellipsis whitespace-nowrap">
                <OverflowCell>{event.description}</OverflowCell>
            </TableCell>
            <TableCell>
                <OverflowCell>{formattedDate}</OverflowCell>
            </TableCell>
            <TableCell>{formattedTime || "-"}</TableCell>
            <TableCell className="max-w-40 overflow-hidden text-ellipsis whitespace-nowrap">
                <OverflowCell>{locationDisplay}</OverflowCell>
            </TableCell>
            <TableCell>{posterActions}</TableCell>
            <TableCell>{registrationLinkActions}</TableCell>
            <TableCell>
                <AuthorAvatar profile={event.profiles} />
            </TableCell>
            <TableCell className="min-w-[150px]">{actions}</TableCell>
        </TableRow>
    );
}