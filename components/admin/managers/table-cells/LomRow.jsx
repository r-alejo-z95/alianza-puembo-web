import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { TableRow, TableCell } from '@/components/ui/table';
import { OverflowCell } from './OverflowCell';
import { Edit, Trash2, Calendar, BookOpen } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatLiteralDate } from '@/lib/date-utils';
import { AuthorAvatar } from '@/components/shared/AuthorAvatar';
import { cn } from "@/lib/utils.ts";

export function LomRow({ post, onEdit, onDelete, compact }) {
    const actions = (
        <div className="flex items-center justify-end gap-2">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onEdit(post)}
                className="rounded-xl hover:bg-[var(--puembo-green)]/10 hover:text-[var(--puembo-green)] transition-all duration-300"
            >
                <Edit className="w-4 h-4" />
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="rounded-xl hover:bg-red-50 hover:text-red-500 transition-all duration-300"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
                    <AlertDialogHeader className="space-y-4">
                        <AlertDialogTitle className="text-2xl font-serif font-bold text-gray-900">¿Deseas eliminar este devocional?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500 font-light leading-relaxed">
                            Esta acción eliminará el devocional permanentemente. Asegúrate de haber guardado una copia si la necesitas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-6">
                        <AlertDialogCancel className="rounded-full border-gray-100">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(post.id)} className="rounded-full bg-red-500 hover:bg-red-600">Confirmar eliminación</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );

    const formattedDate = formatLiteralDate(post.publication_date, "d 'de' MMMM, yyyy");

    if (compact) {
        return (
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-4 relative group">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-[var(--puembo-green)] uppercase tracking-widest">Devocional</span>
                        <h3 className="text-xl font-serif font-bold text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors line-clamp-2">
                            {post.title}
                        </h3>
                    </div>
                    <AuthorAvatar profile={post.profiles} className="h-10 w-10 border-2 border-white shadow-md" />
                </div>
                
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                    <Calendar className="w-3 h-3" /> {formattedDate}
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-gray-50">
                    <div className="flex gap-2">{actions}</div>
                </div>
            </div>
        );
    }

    return (
        <TableRow className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50">
            <TableCell className="px-8 py-6 w-1/3">
                <div className="max-w-[250px]">
                    <OverflowCell className="font-bold text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors">
                        {post.title}
                    </OverflowCell>
                </div>
            </TableCell>
            <TableCell className="px-8 py-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 text-xs font-bold text-gray-600">
                    <Calendar className="w-3 h-3 text-[var(--puembo-green)]" />
                    {formattedDate}
                </div>
            </TableCell>
            <TableCell className="px-8 py-6">
                <div className="flex justify-center">
                    <AuthorAvatar profile={post.profiles} className="border-2 border-white shadow-sm" />
                </div>
            </TableCell>
            <TableCell className="px-8 py-6">{actions}</TableCell>
        </TableRow>
    );
}