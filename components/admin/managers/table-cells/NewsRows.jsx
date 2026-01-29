import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { TableRow, TableCell } from "@/components/ui/table";
import { OverflowCell } from "./OverflowCell";
import { toast } from "sonner";
import { Edit, Trash2, Link as LinkIcon, Copy, Calendar, Clock, Eye, Send } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatLiteralDate, formatInEcuador } from "@/lib/date-utils";
import { AuthorAvatar } from "@/components/shared/AuthorAvatar";
import { cn } from "@/lib/utils.ts";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const formatNewsTime = (timeStr) => {
  if (!timeStr) return "-";
  const parts = timeStr.split(":");
  return `${parts[0]}:${parts[1]}`;
};

export function NewsRow({ newsItem, publicPage, onEdit, onDelete, compact, isSelected, onSelect }) {
  const isScheduled = new Date(newsItem.publish_at) > new Date();

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
            <AlertDialogTitle className="text-2xl font-serif font-bold text-gray-900">¿Mover a la papelera?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 font-light leading-relaxed">
              Esta noticia dejará de ser visible al público, pero podrás restaurarla desde la papelera de reciclaje si lo necesitas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel className="rounded-full border-gray-100">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="rounded-full bg-red-500 hover:bg-red-600">Mover a papelera</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  const formattedDate = newsItem.news_date
    ? formatLiteralDate(newsItem.news_date, "d 'de' MMM, yyyy")
    : "-";
  const formattedTime = newsItem.news_time ? formatNewsTime(newsItem.news_time) : "-";

  const formattedPublishAt = formatInEcuador(newsItem.publish_at, "d 'de' MMM, HH:mm");

  // Construir URL con página y ancla
  const publicHref = `/noticias?page=${publicPage}#${newsItem.id}`;

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
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-[var(--puembo-green)] uppercase tracking-widest">Noticia</span>
                  {isScheduled && (
                    <Badge variant="outline" className="text-[8px] h-4 border-[var(--puembo-green)]/30 text-[var(--puembo-green)] bg-[var(--puembo-green)]/5 uppercase tracking-tighter">
                      Programada
                    </Badge>
                  )}
                </div>
                <OverflowCell 
                href={publicHref}
                linkText="Ver noticia"
                className="text-lg font-serif font-bold text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors whitespace-normal break-words leading-tight"
                >
                {newsItem.title}
                </OverflowCell>
            </div>
          </div>
          <AuthorAvatar profile={newsItem.profiles} className="h-8 w-8 border-2 border-white shadow-sm shrink-0" />
        </div>
        
        <p className="text-xs text-gray-500 font-light line-clamp-2 leading-relaxed pl-9">
          {newsItem.description || "Sin descripción."}
        </p>

        <div className="flex flex-wrap gap-4 pt-1 pl-9">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
            <Calendar className="w-3 h-3 text-[var(--puembo-green)]/50" /> {formattedDate}
          </div>
          {isScheduled && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--puembo-green)]/70">
              <Send className="w-3 h-3" /> {formattedPublishAt}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-gray-50 pl-9">
          <div className="flex gap-1">{actions}</div>
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
      <TableCell className="px-4 py-6 w-1/4">
        <div className="max-w-[200px] space-y-1">
          <div className="flex items-center gap-2">
            {isScheduled && (
              <Badge variant="outline" className="text-[8px] h-4 border-[var(--puembo-green)]/30 text-[var(--puembo-green)] bg-[var(--puembo-green)]/5 uppercase tracking-tighter">
                Programada
              </Badge>
            )}
          </div>
          <OverflowCell 
            href={publicHref}
            linkText="Ver noticia"
            className="font-bold text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors"
          >
            {newsItem.title}
          </OverflowCell>
        </div>
      </TableCell>
      <TableCell className="px-8 py-6 w-[20%]">
        <div className="max-w-[200px]">
          <OverflowCell className="text-sm text-gray-500 font-light italic">
            {newsItem.description || "-"}
          </OverflowCell>
        </div>
      </TableCell>
      <TableCell className="px-8 py-6 min-w-[150px]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <Calendar className="w-3 h-3 text-[var(--puembo-green)]" /> {formattedDate}
          </div>
          {isScheduled ? (
            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--puembo-green)]/80">
              <Send className="w-3 h-3" /> {formattedPublishAt}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock className="w-3 h-3" /> {formattedTime}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="px-8 py-6 text-center">
        <div className="flex justify-center">
          <AuthorAvatar profile={newsItem.profiles} className="border-2 border-white shadow-sm" />
        </div>
      </TableCell>
      <TableCell className="px-8 py-6">{actions}</TableCell>
    </TableRow>
  );
}