import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { TableRow, TableCell } from '@/components/ui/table';
import { OverflowCell } from './OverflowCell';
import { Edit, Trash2, Copy, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatInEcuador } from '@/lib/date-utils';

export function FormRow({ form, onEdit, onDelete, compact }) {
    const handleCopyLink = () => {
        const url = `${window.location.origin}/formularios/${form.slug}`;
        navigator.clipboard.writeText(url).then(() => {
            toast.success('Enlace copiado al portapapeles.');
        }, (err) => {
            toast.error('No se pudo copiar el enlace.');
            console.error('Could not copy text: ', err);
        });
    };

    const handleCopySheetLink = () => {
        if (form.google_sheet_url) {
            navigator.clipboard.writeText(form.google_sheet_url).then(() => {
                toast.success('URL de la hoja de cálculo copiada al portapapeles.');
            }, (err) => {
                toast.error('No se pudo copiar la URL de la hoja de cálculo.');
                console.error('Could not copy text: ', err);
            });
        }
    };

    const formLinkActions = form.slug ? (
        <div className="flex items-center gap-1">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                            <a href={`${window.location.origin}/formularios/${form.slug}`} target="_blank" rel="noopener noreferrer" aria-label="Ir al formulario">
                                <LinkIcon className="w-4 h-4" />
                            </a>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ir al formulario</TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost" size="icon"
                            onClick={handleCopyLink}
                            aria-label="Copiar enlace del formulario"
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copiar enlace del formulario</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    ) : "-";

    const sheetLinkActions = form.google_sheet_url ? (
        <div className="flex items-center gap-1">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                            <a href={form.google_sheet_url} target="_blank" rel="noopener noreferrer" aria-label="Ir a la hoja de cálculo">
                                <LinkIcon className="w-4 h-4" />
                            </a>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ir a la hoja de cálculo</TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost" size="icon"
                            onClick={handleCopySheetLink}
                            aria-label="Copiar URL de la hoja de cálculo"
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copiar URL de la hoja de cálculo</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    ) : "-";

    const actions = (
        <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" aria-label="Editar formulario" onClick={() => onEdit(form)}>
                <Edit className="w-4 h-4" />
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" aria-label="Eliminar formulario">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el formulario y todos sus datos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(form.id)}>Continuar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );

    const formattedDate = formatInEcuador(form.created_at, "d 'de' MMM, yyyy");

    if (compact) {
        return (
            <div className='border rounded-lg p-4 shadow-sm space-y-2'>
                <div><span className="font-semibold">Título:</span> <OverflowCell>{form.title}</OverflowCell></div>
                <div><span className="font-semibold">Descripción:</span> <OverflowCell>{form.description}</OverflowCell></div>
                <div><span className="font-semibold">Fecha de Creación:</span> {formattedDate}</div>
                {form.slug && <div><span className="font-semibold">Link:</span> {formLinkActions}</div>}
                {form.google_sheet_url && <div><span className="font-semibold">Respuestas:</span> {sheetLinkActions}</div>}
                <div className="flex gap-2 pt-2">{actions}</div>
            </div>
        );
    }

    return (
        <TableRow>
            <TableCell className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                <OverflowCell>{form.title}</OverflowCell>
            </TableCell>
            <TableCell className="max-w-md overflow-hidden text-ellipsis whitespace-nowrap">
                <OverflowCell>{form.description}</OverflowCell>
            </TableCell>
            <TableCell>{formattedDate}</TableCell>
            <TableCell>{formLinkActions}</TableCell>
            <TableCell>{sheetLinkActions}</TableCell>
            <TableCell className="min-w-[120px]">{actions}</TableCell>
        </TableRow>
    );
}
