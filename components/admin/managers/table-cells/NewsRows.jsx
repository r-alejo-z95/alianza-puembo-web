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
import { Edit, Trash2, Link as LinkIcon, Copy, Calendar, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatLiteralDate } from "@/lib/date-utils";
import { AuthorAvatar } from "@/components/shared/AuthorAvatar";
import { cn } from "@/lib/utils.ts";

const formatNewsTime = (timeStr) => {
  if (!timeStr) return "-";
  const parts = timeStr.split(":");
  return `${parts[0]}:${parts[1]}`;
};

export function NewsRow({ newsItem, onEdit, onDelete, compact }) {
  const posterActions = newsItem.image_url ? (
    <div className="flex items-center justify-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={newsItem.image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-[var(--puembo-green)] hover:bg-[var(--puembo-green)]/10 transition-all duration-300"
            >
              <LinkIcon className="w-4 h-4" />
            </a>
          </TooltipTrigger>
          <TooltipContent>Ver multimedia</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                navigator.clipboard.writeText(newsItem.image_url);
                toast.success("URL copiada.");
              }}
              className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-[var(--puembo-green)] hover:bg-[var(--puembo-green)]/10 transition-all duration-300"
            >
              <Copy className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Copiar enlace</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  ) : (
    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Sin Imagen</span>
  );

  const actions = (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onEdit}
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
            <AlertDialogTitle className="text-2xl font-serif font-bold text-gray-900">¿Deseas archivar esta historia?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 font-light leading-relaxed">
              Esta acción eliminará la noticia de la vista pública permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel className="rounded-full border-gray-100">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="rounded-full bg-red-500 hover:bg-red-600">Eliminar permanentemente</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  const formattedDate = newsItem.news_date
    ? formatLiteralDate(newsItem.news_date, "d 'de' MMM, yyyy")
    : "-";
  const formattedTime = newsItem.news_time ? formatNewsTime(newsItem.news_time) : "-";

  if (compact) {
    return (
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-4 relative group">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-[var(--puembo-green)] uppercase tracking-widest">Noticia</span>
            <h3 className="text-xl font-serif font-bold text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors line-clamp-2">
              {newsItem.title}
            </h3>
          </div>
          <AuthorAvatar profile={newsItem.profiles} className="h-10 w-10 border-2 border-white shadow-md" />
        </div>
        
        <p className="text-sm text-gray-500 font-light line-clamp-2 leading-relaxed">
          {newsItem.description || "Sin descripción."}
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
            <Calendar className="w-3 h-3" /> {formattedDate}
          </div>
          {formattedTime !== "-" && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
              <Clock className="w-3 h-3" /> {formattedTime}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex gap-2">{posterActions}</div>
          <div className="flex gap-2">{actions}</div>
        </div>
      </div>
    );
  }

  return (
    <TableRow className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50">
      <TableCell className="px-8 py-6 w-1/4">
        <div className="max-w-[200px]">
          <OverflowCell className="font-bold text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors">{newsItem.title}</OverflowCell>
        </div>
      </TableCell>
      <TableCell className="px-8 py-6 w-1/3">
        <div className="max-w-[300px]">
          <OverflowCell className="text-sm text-gray-500 font-light italic">
            {newsItem.description || "-"}
          </OverflowCell>
        </div>
      </TableCell>
      <TableCell className="px-8 py-6 min-w-[150px]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <Calendar className="w-3 h-3 text-[var(--puembo-green)]" /> {formattedDate}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3 h-3" /> {formattedTime}
          </div>
        </div>
      </TableCell>
      <TableCell className="px-8 py-6 text-center">{posterActions}</TableCell>
      <TableCell className="px-8 py-6">
        <div className="flex justify-center">
          <AuthorAvatar profile={newsItem.profiles} className="border-2 border-white shadow-sm" />
        </div>
      </TableCell>
      <TableCell className="px-8 py-6">{actions}</TableCell>
    </TableRow>
  );
}
