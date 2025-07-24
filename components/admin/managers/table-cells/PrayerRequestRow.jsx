import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { OverflowCell } from './OverflowCell';
import { Trash2, Edit } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PrayerRequestStatusDialog from '../../forms/PrayerRequestStatusDialog';
import { useState } from 'react';

export function PrayerRequestRow({ request, onDelete, onStatusChange, compact }) {
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const statusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge>Pendiente</Badge>;
      case 'approved':
        return <Badge variant="approved">Aprobada</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rechazada</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const actions = (
    <div className="flex gap-2">
      {request.is_public ? (
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Cambiar estado" title="Cambiar estado">
              <Edit className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambiar Estado de Petición</DialogTitle>
            </DialogHeader>
            <PrayerRequestStatusDialog
              request={request}
              onStatusChange={onStatusChange}
              onClose={() => setIsStatusDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      ) : (
        <Button disabled variant="outline" size="icon" aria-label="Edicion desactivada" title="Edicion desactivada">
          <Edit className="w-4 h-4" />
        </Button>
      )}
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
    </div>
  );

  if (compact) {
    return (
      <div className='border rounded-lg p-4 shadow-sm space-y-2'>
        <div><span className="font-semibold">Petición:</span> <OverflowCell>{request.request_text}</OverflowCell></div>
        <div><span className="font-semibold">Nombre:</span> <OverflowCell>{request.name || "N/A"}</OverflowCell></div>
        <div><span className="font-semibold">Fecha:</span> {new Date(request.created_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Guayaquil' })}</div>
        <div><span className="font-semibold">Tipo:</span>
          <div className="flex gap-2 mt-1">
            {request.is_public ? (
              <Badge variant="outline">Pública</Badge>
            ) : (
              <Badge variant="blue">Privada</Badge>
            )}
            {request.is_anonymous && <Badge variant="secondary">Anónima</Badge>}
          </div>
        </div>
        {request.is_public && (
          <div><span className="font-semibold">Estado:</span>
            <div className="flex gap-2 mt-1">
              {statusBadge(request.status)}
            </div>
          </div>
        )}
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
      <TableCell>{new Date(request.created_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Guayaquil' })}</TableCell>
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
      {request.is_public ? (
        <TableCell>{statusBadge(request.status)}</TableCell>
      ) : <TableCell />
      }
      <TableCell>{actions}</TableCell>
    </TableRow>
  );
}