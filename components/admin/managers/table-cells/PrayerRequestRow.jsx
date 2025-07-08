
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { OverflowCell } from './OverflowCell';
import { Trash2 } from 'lucide-react';

export function PrayerRequestRow({ request, onDelete, compact }) {
    const actions = (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" aria-label="Eliminar petición">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. La petición será eliminada permanentemente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(request.id)}>Eliminar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );

    if (compact) {
        return (
            <div className='border rounded-lg p-4 shadow-sm space-y-2'>
                <div><span className="font-semibold">Petición:</span> <OverflowCell>{request.request_text}</OverflowCell></div>
                <div><span className="font-semibold">Nombre:</span> <OverflowCell>{request.name || "N/A"}</OverflowCell></div>
                <div><span className="font-semibold">Fecha:</span> {new Date(request.created_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                <div>
                    <span className="font-semibold">Estado:</span>
                    <div className="flex gap-2 mt-1">
                        {request.is_public ? (
                            <Badge variant="outline">Pública</Badge>
                        ) : (
                            <Badge variant="blue">Privada</Badge>
                        )}
                        {request.is_anonymous && <Badge variant="secondary">Anónima</Badge>}
                    </div>
                </div>
                <div className="flex gap-2 pt-2">{actions}</div>
            </div>
        );
    }

    return (
        <TableRow>
            <TableCell className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                <OverflowCell>{request.request_text}</OverflowCell>
            </TableCell>
            <TableCell className="max-w-36 overflow-hidden text-ellipsis whitespace-nowrap">
                <OverflowCell>{request.name || "N/A"}</OverflowCell>
            </TableCell>
            <TableCell>{new Date(request.created_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
            <TableCell>
                <div className="flex gap-2">
                    {request.is_public ? (
                        <Badge variant="outline">Pública</Badge>
                    ) : (
                        <Badge variant="blue">Privada</Badge>
                    )}
                    {request.is_anonymous && <Badge variant="secondary">Anónima</Badge>}
                </div>
            </TableCell>
            <TableCell>{actions}</TableCell>
        </TableRow>
    );
}
