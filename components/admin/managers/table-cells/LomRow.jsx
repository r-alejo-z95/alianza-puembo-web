import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { TableRow, TableCell } from '@/components/ui/table';
import { OverflowCell } from './OverflowCell';
import { Edit, Trash2, Calendar, BookOpen } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatLiteralDate } from '@/lib/date-utils';
import { AuthorAvatar } from '@/components/shared/AuthorAvatar';
import { cn } from "@/lib/utils.ts";
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';

export function LomRow({ post, onEdit, onDelete, compact, isSelected, onSelect }) {
    const actions = (
        <div className="flex items-center justify-end gap-2 w-full lg:w-auto">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onEdit(post)}
                className="rounded-xl flex-1 lg:flex-none text-[var(--puembo-green)] lg:text-black hover:bg-[var(--puembo-green)]/10 lg:hover:text-[var(--puembo-green)] transition-all duration-300"
            >
                <Edit className="w-4 h-4" />
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="rounded-xl flex-1 lg:flex-none text-red-500 lg:text-black hover:bg-red-50 lg:hover:text-red-500 transition-all duration-300"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
                    <AlertDialogHeader className="space-y-4">
                        <AlertDialogTitle className="text-2xl font-serif font-bold text-gray-900">¿Mover a la papelera?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500 font-light leading-relaxed">
                            Esta lectura dejará de ser visible para el público, pero podrás restaurarla desde la papelera de reciclaje si lo necesitas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-6">
                        <AlertDialogCancel className="rounded-full border-gray-100">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault();
                                onDelete(post.id);
                            }} 
                            className="rounded-full bg-red-500 hover:bg-red-600"
                        >
                            Mover a papelera
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );

    const formattedDate = formatLiteralDate(post.publication_date, "d 'de' MMMM, yyyy");

    if (compact) {
        return (
            <div className={cn(
                "bg-white rounded-[1.5rem] p-4 shadow-sm border transition-all duration-200 space-y-3 relative group",
                isSelected ? "border-green-200 bg-green-50/30" : "border-gray-100"
            )}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                        <Checkbox 
                            checked={isSelected}
                            onCheckedChange={onSelect}
                            className="mt-1 rounded-md border-gray-300 data-[state=checked]:bg-[var(--puembo-green)] data-[state=checked]:border-[var(--puembo-green)]"
                        />
                        <div className="space-y-1 min-w-0">
                            <span className="text-[9px] font-black text-[var(--puembo-green)] uppercase tracking-widest">Devocional</span>
                            <OverflowCell 
                                href={`/recursos/lom/${post.slug}`}
                                linkText="Ver devocional"
                                className="text-lg font-serif font-bold text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors whitespace-normal break-words leading-tight"
                            >
                                {post.title}
                            </OverflowCell>
                        </div>
                    </div>
                    <AuthorAvatar profile={post.profiles} className="h-8 w-8 border-2 border-white shadow-sm shrink-0" />
                </div>
                
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 pl-9">
                    <Calendar className="w-3 h-3 text-[var(--puembo-green)]/50" /> {formattedDate}
                </div>

                <div className="flex items-center justify-end pt-3 border-t border-gray-50 pl-9">
                    <div className="flex gap-1 w-full">{actions}</div>
                </div>
            </div>
        );
    }

    return (
        <TableRow className={cn(
            "group hover:bg-gray-50/50 transition-colors border-b border-gray-50",
            isSelected && "bg-green-50/30 hover:bg-green-50/40"
        )}>
            <TableCell className="px-6 py-6 w-[40px]">
                <Checkbox 
                    checked={isSelected}
                    onCheckedChange={onSelect}
                    className="rounded-md border-gray-300 data-[state=checked]:bg-[var(--puembo-green)] data-[state=checked]:border-[var(--puembo-green)]"
                />
            </TableCell>
            <TableCell className="px-4 py-6 w-1/3">
                <div className="max-w-[250px]">
                    <OverflowCell 
                        href={`/recursos/lom/${post.slug}`}
                        linkText="Ver devocional"
                        className="font-bold text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors"
                    >
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