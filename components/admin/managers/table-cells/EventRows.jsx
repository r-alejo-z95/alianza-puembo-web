import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { TableRow, TableCell } from '@/components/ui/table';
import { OverflowCell } from './OverflowCell';
import { toast } from 'sonner';

export function EventRow({ event, onEdit, onDelete, compact }) {
    const posterActions = event.poster_url ? (
        <div>
            <a href={event.poster_url} className="text-blue-600 hover:underline cursor-pointer" target="_blank" rel="noopener noreferrer">Ver</a>
            <button
                className="ml-2 text-blue-600 hover:underline cursor-pointer"
                onClick={() => {
                    navigator.clipboard.writeText(event.poster_url);
                    toast.success('URL del póster copiado al portapapeles.');
                }}
            >
                Copiar URL
            </button>
        </div>
    ) : "-";

    const actions = (
        <>
            <Button variant="outline" size="sm" className="mr-2" onClick={onEdit}>Editar</Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">Eliminar</Button>
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
        </>
    );

    if (compact) {
        return (
            <div className='border rounded-lg p-4 shadow-sm space-y-2'>
                <div><span className="font-semibold">Título:</span> {event.title}</div>
                <div><span className="font-semibold">Descripción:</span> {event.description}</div>
                <div><span className="font-semibold">Fecha:</span> {new Date(event.start_time).toLocaleDateString('es-ES', { dateStyle: 'medium' })}</div>
                <div><span className="font-semibold">Hora:</span> {new Date(event.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
                {event.poster_url && <div><span className="font-semibold">Póster:</span> {posterActions}</div>}
                <div className="flex gap-2 pt-2">{actions}</div>
            </div>
        );
    }

    return (
        <TableRow>
            <TableCell className="max-w-36 overflow-hidden text-ellipsis whitespace-nowrap">
                <OverflowCell>{event.title}</OverflowCell>
            </TableCell>
            <TableCell className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                <OverflowCell>{event.description}</OverflowCell>
            </TableCell>
            <TableCell>{new Date(event.start_time).toLocaleDateString('es-ES', { dateStyle: 'medium' })}</TableCell>
            <TableCell>{new Date(event.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</TableCell>
            <TableCell>{posterActions}</TableCell>
            <TableCell className="min-w-[150px]">{actions}</TableCell>
        </TableRow>
    );
}