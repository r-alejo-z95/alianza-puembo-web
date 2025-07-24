import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { TableRow, TableCell } from '@/components/ui/table';
import { OverflowCell } from './OverflowCell';
import { Edit, Trash2 } from 'lucide-react';

export function LomRow({ post, onEdit, onDelete, compact }) {
    const actions = (
        <>
            <Button variant="outline" size="icon" aria-label="Editar devocional" className="mr-2" onClick={() => onEdit(post)}>
                <Edit className="w-4 h-4" />
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" aria-label="Eliminar devocional">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el devocional.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(post.id)}>Continuar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );

    const formattedDate = new Date(post.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/Guayaquil',
    });

    if (compact) {
        return (
            <div className='border rounded-lg p-4 shadow-sm space-y-2'>
                <div><span className="font-semibold">Título:</span> <OverflowCell>{post.title}</OverflowCell></div>
                <div><span className="font-semibold">Fecha de Publicación:</span> {formattedDate}</div>
                <div className="flex gap-2 pt-2">{actions}</div>
            </div>
        );
    }

    return (
        <TableRow>
            <TableCell className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                <OverflowCell>{post.title}</OverflowCell>
            </TableCell>
            <TableCell>{formattedDate}</TableCell>
            <TableCell className="min-w-[150px]">{actions}</TableCell>
        </TableRow>
    );
}
