import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { TableRow, TableCell } from '@/components/ui/table';
import { OverflowCell } from './OverflowCell';
import { toast } from 'sonner';
import { Edit, Trash2, Link as LinkIcon, Copy, MapPin, Calendar, Clock, ExternalLink, Repeat } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getEventColorClasses } from '@/components/public/calendar/event-calendar/utils';
import { formatEventDateRange, formatEventTimeRange } from '@/lib/date-utils';
import { AuthorAvatar } from '@/components/shared/AuthorAvatar';
import { cn } from '@/lib/utils.ts';
import Link from 'next/link';

export function EventRow({ event, onEdit, onDelete, compact }) {
    const registrationActions = event.registration_link ? (
        <div className="flex items-center justify-center gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <a 
                            href={event.registration_link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-2 px-4 py-2 lg:p-2 rounded-xl bg-[var(--puembo-green)]/10 text-[var(--puembo-green)] lg:text-black lg:hover:bg-[var(--puembo-green)] lg:hover:text-white transition-all duration-300"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest lg:hidden">Formulario de Registro</span>
                        </a>
                    </TooltipTrigger>
                    <TooltipContent>Formulario de Registro</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    ) : <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Sin Link</span>;

    const actions = (
        <div className="flex items-center justify-end gap-2">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={onEdit}
                className="rounded-xl text-[var(--puembo-green)] lg:text-black hover:bg-[var(--puembo-green)]/10 lg:hover:text-[var(--puembo-green)] transition-all duration-300"
            >
                <Edit className="w-4 h-4" />
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="rounded-xl text-red-500 lg:text-black hover:bg-red-50 lg:hover:text-red-500 transition-all duration-300"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
                    <AlertDialogHeader className="space-y-4">
                        <AlertDialogTitle className="text-2xl font-serif font-bold text-gray-900">¿Deseas cancelar este evento?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500 font-light leading-relaxed">
                            Esta acción eliminará el evento de la agenda pública permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-6">
                        <AlertDialogCancel className="rounded-full border-gray-100">Cerrar</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete} className="rounded-full bg-red-500 hover:bg-red-600">Confirmar eliminación</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );

    const formattedDate = formatEventDateRange(event.start_time, event.end_time, event.is_multi_day);
    const formattedTime = formatEventTimeRange(event.start_time, event.end_time, event.all_day, event.is_multi_day);

    const recurrenceLabel = {
        weekly: "Semanal",
        biweekly: "Quincenal",
        monthly: "Mensual",
        yearly: "Anual"
    };

    if (compact) {
        return (
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-4 relative group">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                {event.color && <div className={`w-2.5 h-2.5 rounded-full ${getEventColorClasses(event.color)}`} />}
                                                <span className="text-[10px] font-black text-[var(--puembo-green)] uppercase tracking-widest">Actividad</span>
                                                {event.is_recurring && (
                                                    <div className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-tighter border border-amber-100">
                                                        <Repeat className="w-2.5 h-2.5" />
                                                        {recurrenceLabel[event.recurrence_pattern] || "Recurrente"}
                                                    </div>
                                                )}
                                            </div>
                                            <OverflowCell 
                                                href={`/eventos/${event.slug}`}
                                                linkText="Ver evento"
                                                className="text-xl font-serif font-bold text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors whitespace-normal break-words"
                                            >
                                                {event.title}
                                            </OverflowCell>
                                        </div>
                                        <AuthorAvatar profile={event.profiles} className="h-10 w-10 border-2 border-white shadow-md" />
                                    </div>
                                    
                                    <p className="text-sm text-gray-500 font-light line-clamp-2 leading-relaxed">
                                        {event.description || "Sin descripción."}
                                    </p>
                                        <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                        <Calendar className="w-3 h-3" /> {formattedDate}
                    </div>
                    {formattedTime && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                            <Clock className="w-3 h-3" /> {formattedTime}
                        </div>
                    )}
                    {event.location && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                            <MapPin className="w-3 h-3" /> {event.location}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex gap-2">{registrationActions}</div>
                    <div className="flex gap-2">{actions}</div>
                </div>
            </div>
        );
    }

    return (
        <TableRow className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50">
            <TableCell className="px-8 py-6 w-1/4">
                <div className="max-w-[180px] flex items-center gap-3">
                    {event.color && <div className={`w-2 h-2 rounded-full shrink-0 ${getEventColorClasses(event.color)}`} />}
                    <div className="flex-grow min-w-0">
                        <div className="flex flex-col gap-1">
                            <OverflowCell 
                                href={`/eventos/${event.slug}`}
                                linkText="Ver evento"
                                className="font-bold text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors"
                            >
                                {event.title}
                            </OverflowCell>
                            {event.is_recurring && (
                                <div className="flex items-center gap-1 w-fit px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-tighter border border-amber-100">
                                    <Repeat className="w-2.5 h-2.5" />
                                    {recurrenceLabel[event.recurrence_pattern] || "Recurrente"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </TableCell>
            <TableCell className="px-8 py-6 w-[20%]">
                <div className="max-w-[150px]">
                    <OverflowCell className="text-xs text-gray-500 font-light italic">{event.description || "-"}</OverflowCell>
                </div>
            </TableCell>
            <TableCell className="px-8 py-6 min-w-[150px]">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                        <Calendar className="w-3 h-3 text-[var(--puembo-green)]" /> {formattedDate}
                    </div>
                    {formattedTime && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Clock className="w-3 h-3" /> {formattedTime}
                        </div>
                    )}
                </div>
            </TableCell>
            <TableCell className="px-8 py-6 text-center">{registrationActions}</TableCell>
            <TableCell className="px-8 py-6">
                <div className="flex justify-center">
                    <AuthorAvatar profile={event.profiles} className="border-2 border-white shadow-sm" />
                </div>
            </TableCell>
            <TableCell className="px-8 py-6">{actions}</TableCell>
        </TableRow>
    );
}