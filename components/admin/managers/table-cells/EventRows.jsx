import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { TableRow, TableCell } from '@/components/ui/table';
import { OverflowCell } from './OverflowCell';
import { toast } from 'sonner';
import { Edit, Trash2, Link as LinkIcon, Copy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

    if (compact) {
        return (
            <div className='border rounded-lg p-4 shadow-sm space-y-2'>
                <div><span className="font-semibold">Título:</span> {event.title}</div>
                <div><span className="font-semibold">Descripción:</span> {event.description}</div>
                <div><span className="font-semibold">Fecha:</span> {formattedDate}</div>
                <div><span className="font-semibold">Hora:</span> {new Date(event.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Guayaquil' })} - {new Date(event.end_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Guayaquil' })}</div>
                {event.poster_url && <div><span className="font-semibold">Póster:</span> {posterActions}</div>}
                {event.registration_link && <div><span className="font-semibold">Link de Registro:</span> {registrationLinkActions}</div>}
                <div className="flex gap-2 pt-2">{actions}</div>
            </div>
        );
    }

    return (
        <TableRow>
            <TableCell className="max-w-36 overflow-hidden text-ellipsis whitespace-nowrap">
                <OverflowCell>{event.title}</OverflowCell>
            </TableCell>
            <TableCell className="max-w-68 overflow-hidden text-ellipsis whitespace-nowrap">
                <OverflowCell>{event.description}</OverflowCell>
            </TableCell>
            <TableCell>
                <OverflowCell>{formattedDate}</OverflowCell>
            </TableCell>
            <TableCell>{new Date(event.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Guayaquil' })} - {new Date(event.end_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Guayaquil' })}</TableCell>
            <TableCell>{posterActions}</TableCell>
            <TableCell>{registrationLinkActions}</TableCell>
            <TableCell className="min-w-[150px]">{actions}</TableCell>
        </TableRow>
    );
}